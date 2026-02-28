import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	const cookieOpts = { path: '/' };
	cookies.delete('spotify_access_token', cookieOpts);
	cookies.delete('spotify_refresh_token', cookieOpts);
	cookies.delete('spotify_expires_at', cookieOpts);
	cookies.delete('spotify_display_name', cookieOpts);
	cookies.delete('spotify_avatar_url', cookieOpts);

	return redirect(302, '/');
};
