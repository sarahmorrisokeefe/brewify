import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get('spotify_access_token');
	const expiresAt = cookies.get('spotify_expires_at');
	const displayName = cookies.get('spotify_display_name');
	const avatarUrl = cookies.get('spotify_avatar_url');

	const isAuthenticated = !!(
		accessToken &&
		expiresAt &&
		Date.now() < parseInt(expiresAt)
	);

	return {
		isAuthenticated,
		displayName: isAuthenticated ? (displayName ?? null) : null,
		avatarUrl: isAuthenticated ? (avatarUrl ?? null) : null
	};
};
