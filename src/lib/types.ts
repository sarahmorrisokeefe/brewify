export interface SpotifyTrack {
	id: string;
	name: string;
	artists: Array<{ id: string; name: string }>;
	album: {
		name: string;
		images: Array<{ url: string; width: number; height: number }>;
	};
	uri: string;
	duration_ms: number;
	external_urls: { spotify: string };
	preview_url: string | null;
}

export interface PlaylistResult {
	id: string;
	name: string;
	description: string;
	external_urls: { spotify: string };
	vibe: string;
	energy: 'low' | 'medium' | 'high';
}

export interface DrinkToPlaylistResponse {
	playlist: PlaylistResult;
	tracks: SpotifyTrack[];
}

export interface CocktailIngredient {
	name: string;
	measure: string;
}

export interface CocktailRecipe {
	id: string;
	name: string;
	category: string;
	alcoholic: string;
	glass: string;
	instructions: string;
	imageUrl: string;
	ingredients: CocktailIngredient[];
}

export interface MusicToDrinkResponse {
	vibe: string;
	reasoning: string;
	cocktails: CocktailRecipe[];
}
