import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import {
	ANTHROPIC_API_KEY,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET
} from '$env/static/private';

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// --- Spotify helpers ---

async function refreshSpotifyToken(refreshToken: string): Promise<string> {
	const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
	const res = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${credentials}`
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});
	if (!res.ok) throw new Error('Failed to refresh Spotify token');
	const data = await res.json();
	return data.access_token;
}

async function getValidToken(cookies: import('@sveltejs/kit').Cookies): Promise<string> {
	let accessToken = cookies.get('spotify_access_token');
	const refreshToken = cookies.get('spotify_refresh_token');
	const expiresAt = cookies.get('spotify_expires_at');

	if (!accessToken || !refreshToken) {
		return error(401, 'Not authenticated with Spotify');
	}

	// Refresh if within 5 minutes of expiry
	if (expiresAt && Date.now() > parseInt(expiresAt) - 300_000) {
		accessToken = await refreshSpotifyToken(refreshToken);
		const newExpiry = Date.now() + 3600_000;
		const cookieOpts = {
			httpOnly: true,
			secure: true,
			sameSite: 'lax' as const,
			path: '/',
			maxAge: 60 * 60 * 24 * 30
		};
		cookies.set('spotify_access_token', accessToken, cookieOpts);
		cookies.set('spotify_expires_at', newExpiry.toString(), cookieOpts);
	}

	return accessToken!;
}

async function spotifyGet(path: string, token: string) {
	const res = await fetch(`https://api.spotify.com/v1${path}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Spotify API error ${res.status}: ${body}`);
	}
	return res.json();
}

async function spotifyPost(path: string, token: string, body: unknown) {
	const res = await fetch(`https://api.spotify.com/v1${path}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Spotify API error ${res.status}: ${err}`);
	}
	return res.json();
}

// --- Claude analysis ---

interface DrinkAnalysis {
	playlistName: string;
	description: string;
	searchTerms: string[];
	vibe: string;
	energy: 'low' | 'medium' | 'high';
}

async function analyzeDrink(drink: string): Promise<DrinkAnalysis> {
	const message = await anthropic.messages.create({
		model: 'claude-sonnet-4-6',
		max_tokens: 1024,
		messages: [
			{
				role: 'user',
				content: `You are a music curator and synesthesia expert. Analyze the vibe and mood of this drink and suggest a perfect playlist concept.

Drink: "${drink}"

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact fields:
{
  "playlistName": "Creative 2-3 word name inspired by the drink (e.g. 'Malbec Midnight', 'Oat Milk Golden Hour', 'Cold Brew Haze')",
  "description": "Evocative 1-2 sentence description of the playlist mood",
  "searchTerms": ["3-5 Spotify search queries that will find great matching songs, e.g. 'cozy indie folk morning acoustic', 'warm jazz café lo-fi', 'melancholy bedroom pop rain'"],
  "vibe": "2-4 word vibe summary (e.g. 'cozy introspective warmth')",
  "energy": "low|medium|high"
}`
			}
		]
	});

	const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
	return JSON.parse(text) as DrinkAnalysis;
}

// --- Main handler ---

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => ({}));
	const drink = typeof body.drink === 'string' ? body.drink.trim() : '';

	if (!drink) return error(400, 'No drink provided');
	if (drink.length > 200) return error(400, 'Drink description too long');

	const token = await getValidToken(cookies);

	// 1. Analyze the drink with Claude
	let analysis: DrinkAnalysis;
	try {
		analysis = await analyzeDrink(drink);
	} catch (e) {
		const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
		console.error('Claude analysis failed:', msg);
		return error(502, `Failed to analyze drink vibe: ${msg}`);
	}

	// 2. Search Spotify for matching tracks
	const allTracks: Record<string, unknown>[] = [];
	const seenIds = new Set<string>();

	for (const term of analysis.searchTerms) {
		try {
			const data = await spotifyGet(
				`/search?q=${encodeURIComponent(term)}&type=track&limit=8&market=US`,
				token
			);
			const items: Record<string, unknown>[] = (data as { tracks?: { items?: Record<string, unknown>[] } }).tracks?.items ?? [];
			for (const track of items) {
				const id = track.id as string;
				if (!seenIds.has(id)) {
					seenIds.add(id);
					allTracks.push(track);
				}
			}
		} catch {
			// Continue with other search terms
		}
	}

	if (allTracks.length === 0) {
		return error(500, 'No tracks found for this vibe — try a different drink description');
	}

	// Shuffle and cap at 25 tracks
	const shuffled = allTracks.sort(() => Math.random() - 0.5).slice(0, 25);

	// 3. Get user ID
	let userId: string;
	try {
		const me = await spotifyGet('/me', token) as { id: string };
		userId = me.id;
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('Failed to get Spotify user info:', msg);
		return error(502, `Failed to get Spotify user info: ${msg}`);
	}

	// 4. Create the playlist
	let playlist: { id: string; name: string; description: string; external_urls: { spotify: string } };
	try {
		playlist = await spotifyPost(`/users/${userId}/playlists`, token, {
			name: analysis.playlistName,
			description: analysis.description,
			public: false
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('Failed to create Spotify playlist:', msg);
		return error(502, `Failed to create Spotify playlist: ${msg}`);
	}

	// 5. Add tracks to the playlist
	const uris = shuffled.map((t) => t.uri as string);
	try {
		await spotifyPost(`/playlists/${playlist.id}/tracks`, token, { uris });
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('Failed to add tracks to playlist:', msg);
		return error(502, `Failed to add tracks to playlist: ${msg}`);
	}

	return json({
		playlist: {
			id: playlist.id,
			name: playlist.name,
			description: playlist.description,
			external_urls: playlist.external_urls,
			vibe: analysis.vibe,
			energy: analysis.energy
		},
		tracks: shuffled.map((t) => ({
			id: t.id,
			name: t.name,
			artists: t.artists,
			album: t.album,
			uri: t.uri,
			duration_ms: t.duration_ms,
			external_urls: t.external_urls,
			preview_url: t.preview_url ?? null
		}))
	});
};
