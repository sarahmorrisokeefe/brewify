import type { RequestHandler } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '$env/static/private';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorParam = url.searchParams.get('error');
	const storedState = cookies.get('spotify_oauth_state');

	if (errorParam) {
		return redirect(302, `/?auth_error=${encodeURIComponent(errorParam)}`);
	}

	if (!state || state !== storedState) {
		return error(400, 'State mismatch — possible CSRF attack');
	}

	cookies.delete('spotify_oauth_state', { path: '/' });

	if (!code) {
		return error(400, 'No authorization code received');
	}

	// Exchange code for tokens
	const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
	const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${credentials}`
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: SPOTIFY_REDIRECT_URI
		})
	});

	if (!tokenResponse.ok) {
		const body = await tokenResponse.text();
		console.error('Token exchange failed:', body);
		return error(500, 'Failed to exchange authorization code');
	}

	const tokens = await tokenResponse.json();
	const expiresAt = Date.now() + tokens.expires_in * 1000;

	// Fetch user profile
	let displayName = '';
	let avatarUrl = '';
	try {
		const profileRes = await fetch('https://api.spotify.com/v1/me', {
			headers: { Authorization: `Bearer ${tokens.access_token}` }
		});
		if (profileRes.ok) {
			const profile = await profileRes.json();
			displayName = profile.display_name ?? profile.id ?? '';
			avatarUrl = profile.images?.[0]?.url ?? '';
		}
	} catch {
		// Non-critical — continue without display name
	}

	const cookieOpts = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax' as const,
		path: '/',
		maxAge: 60 * 60 * 24 * 30 // 30 days
	};

	cookies.set('spotify_access_token', tokens.access_token, cookieOpts);
	cookies.set('spotify_refresh_token', tokens.refresh_token, cookieOpts);
	cookies.set('spotify_expires_at', expiresAt.toString(), cookieOpts);
	if (displayName) cookies.set('spotify_display_name', displayName, { ...cookieOpts, httpOnly: false });
	if (avatarUrl) cookies.set('spotify_avatar_url', avatarUrl, { ...cookieOpts, httpOnly: false });

	return redirect(302, '/');
};
