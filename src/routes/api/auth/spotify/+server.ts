import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '$env/static/private';

const SCOPES = [
	'playlist-modify-public',
	'playlist-modify-private',
	'playlist-read-private',
	'playlist-read-collaborative',
	'user-read-private',
	'user-read-email'
].join(' ');

export const GET: RequestHandler = async ({ cookies }) => {
	const state = crypto.randomUUID();

	cookies.set('spotify_oauth_state', state, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 600 // 10 minutes
	});

	const params = new URLSearchParams({
		client_id: SPOTIFY_CLIENT_ID,
		response_type: 'code',
		redirect_uri: SPOTIFY_REDIRECT_URI,
		scope: SCOPES,
		state,
		show_dialog: 'true'
	});

	return redirect(302, `https://accounts.spotify.com/authorize?${params}`);
};
