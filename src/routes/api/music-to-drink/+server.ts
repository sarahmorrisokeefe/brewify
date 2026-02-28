import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import {
	ANTHROPIC_API_KEY,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET
} from '$env/static/private';
import type { CocktailRecipe, CocktailIngredient } from '$lib/types';

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// --- TheCocktailDB helpers ---

async function fetchCocktailByName(name: string): Promise<CocktailRecipe | null> {
	const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`;
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const data = await res.json();
		const drink = data.drinks?.[0];
		if (!drink) return null;
		return formatCocktail(drink);
	} catch {
		return null;
	}
}

function formatCocktail(drink: Record<string, string | null>): CocktailRecipe {
	const ingredients: CocktailIngredient[] = [];
	for (let i = 1; i <= 15; i++) {
		const name = drink[`strIngredient${i}`];
		const measure = drink[`strMeasure${i}`];
		if (name?.trim()) {
			ingredients.push({
				name: name.trim(),
				measure: measure?.trim() || ''
			});
		}
	}

	return {
		id: drink.idDrink ?? '',
		name: drink.strDrink ?? '',
		category: drink.strCategory ?? '',
		alcoholic: drink.strAlcoholic ?? 'Unknown',
		glass: drink.strGlass ?? '',
		instructions: drink.strInstructions ?? '',
		imageUrl: drink.strDrinkThumb ?? '',
		ingredients
	};
}

// --- Spotify helpers (for optional playlist enrichment) ---

async function refreshSpotifyToken(refreshToken: string): Promise<string> {
	const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
	const res = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${credentials}`
		},
		body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken })
	});
	if (!res.ok) throw new Error('Token refresh failed');
	const data = await res.json();
	return data.access_token;
}

interface SpotifyPlaylistSnippet {
	name: string;
	description?: string;
	trackNames: string[];
}

async function fetchSpotifyPlaylist(
	playlistId: string,
	cookies: import('@sveltejs/kit').Cookies
): Promise<SpotifyPlaylistSnippet | null> {
	let token = cookies.get('spotify_access_token');
	const refreshToken = cookies.get('spotify_refresh_token');
	const expiresAt = cookies.get('spotify_expires_at');

	if (!token || !refreshToken) return null;

	try {
		if (expiresAt && Date.now() > parseInt(expiresAt) - 300_000) {
			token = await refreshSpotifyToken(refreshToken);
		}

		const res = await fetch(
			`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,tracks.items(track(name,artists))`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		if (!res.ok) return null;
		const data = await res.json();

		const trackNames: string[] = (data.tracks?.items ?? [])
			.slice(0, 8)
			.map((item: { track?: { name?: string; artists?: Array<{ name: string }> } }) =>
				item.track ? `"${item.track.name}" by ${item.track.artists?.[0]?.name ?? 'Unknown'}` : null
			)
			.filter(Boolean);

		return {
			name: data.name,
			description: data.description,
			trackNames
		};
	} catch {
		return null;
	}
}

// --- Claude analysis ---

interface MusicAnalysis {
	cocktails: string[];
	vibe: string;
	reasoning: string;
}

const COMMON_COCKTAILS = `
Margarita, Mojito, Old Fashioned, Negroni, Martini, Manhattan, Cosmopolitan, Daiquiri,
Aperol Spritz, Whiskey Sour, Pisco Sour, French 75, Espresso Martini, Moscow Mule,
Dark and Stormy, Mai Tai, Piña Colada, White Russian, Bloody Mary, Sex on the Beach,
Gin and Tonic, Tom Collins, Singapore Sling, Sidecar, Gimlet, Caipirinha, Paloma,
Americano, Clover Club, Bee's Knees, Last Word, Paper Plane, Corpse Reviver,
Boulevardier, Penicillin, Jungle Bird, Naked and Famous, Clover Club, Aviation,
Black Russian, Long Island Iced Tea, Blue Lagoon, Harvey Wallbanger, Amaretto Sour`.trim();

async function analyzeMusicWithClaude(
	musicInput: string,
	failedNames: string[],
	needed: number
): Promise<MusicAnalysis> {
	const failedContext =
		failedNames.length > 0
			? `\n\nIMPORTANT: These cocktail names were NOT found in TheCocktailDB — do NOT suggest them again: ${failedNames.join(', ')}.`
			: '';

	const message = await anthropic.messages.create({
		model: 'claude-sonnet-4-6',
		max_tokens: 1024,
		messages: [
			{
				role: 'user',
				content: `You are a creative mixologist and music synesthesia expert. Given this music input, suggest ${needed} cocktails that perfectly match the vibe.${failedContext}

Music input: "${musicInput}"

Only suggest cocktails from this verified list (or similar well-known classics):
${COMMON_COCKTAILS}

Return ONLY a valid JSON object (no markdown, no code blocks) with these exact fields:
{
  "cocktails": ["ExactCocktailName1"${needed > 1 ? ', "ExactCocktailName2"' : ''}${needed > 2 ? ', "ExactCocktailName3"' : ''}],
  "vibe": "Short evocative music vibe description (e.g. 'sultry midnight jazz', 'sun-drenched Balearic energy')",
  "reasoning": "Why these cocktails match the music vibe (2-3 sentences, specific and creative)"
}`
			}
		]
	});

	const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
	return JSON.parse(text) as MusicAnalysis;
}

// --- Main handler ---

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => ({}));
	const musicInput = typeof body.musicInput === 'string' ? body.musicInput.trim() : '';

	if (!musicInput) return error(400, 'No music input provided');
	if (musicInput.length > 500) return error(400, 'Input too long');

	// Optionally enrich Spotify playlist URLs with real track data
	let enrichedInput = musicInput;
	const spotifyPlaylistMatch = musicInput.match(
		/spotify\.com\/playlist\/([a-zA-Z0-9]+)|spotify:playlist:([a-zA-Z0-9]+)/
	);
	if (spotifyPlaylistMatch) {
		const playlistId = spotifyPlaylistMatch[1] ?? spotifyPlaylistMatch[2];
		const snippet = await fetchSpotifyPlaylist(playlistId, cookies);
		if (snippet) {
			enrichedInput = `Spotify playlist "${snippet.name}"${snippet.description ? ` — ${snippet.description}` : ''}. Sample tracks: ${snippet.trackNames.join(', ')}.`;
		}
	}

	// Iterative Claude + TheCocktailDB with retry logic
	const foundCocktails: CocktailRecipe[] = [];
	const failedNames: string[] = [];
	let vibe = '';
	let reasoning = '';

	for (let attempt = 0; attempt < 3 && foundCocktails.length < 3; attempt++) {
		const needed = 3 - foundCocktails.length;

		let analysis: MusicAnalysis;
		try {
			analysis = await analyzeMusicWithClaude(enrichedInput, failedNames, needed);
		} catch (e) {
			const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
			console.error('Claude analysis failed:', msg);
			return error(502, `Failed to analyze music vibe: ${msg}`);
		}

		if (!vibe) {
			vibe = analysis.vibe;
			reasoning = analysis.reasoning;
		}

		for (const name of analysis.cocktails.slice(0, needed)) {
			const cocktail = await fetchCocktailByName(name);
			if (cocktail) {
				foundCocktails.push(cocktail);
			} else {
				failedNames.push(name);
			}
		}
	}

	if (foundCocktails.length === 0) {
		return error(502, 'Could not find matching cocktails — please try a different music input');
	}

	return json({
		vibe,
		reasoning,
		cocktails: foundCocktails
	});
};
