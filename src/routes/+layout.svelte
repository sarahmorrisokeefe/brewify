<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<title>Brewify — Drinks meet music</title>
</svelte:head>

<div class="app-shell">
	<!-- Ambient background blobs -->
	<div class="ambient-blob blob-1" aria-hidden="true"></div>
	<div class="ambient-blob blob-2" aria-hidden="true"></div>

	<!-- Nav -->
	<nav class="nav">
		<a href="/" class="nav-logo">
			<span class="logo-icon">⬡</span>
			<span class="logo-text">Brewify</span>
		</a>

		<div class="nav-right">
			{#if data.isAuthenticated}
				<div class="user-info">
					{#if data.avatarUrl}
						<img src={data.avatarUrl} alt={data.displayName ?? 'Profile'} class="user-avatar" />
					{/if}
					{#if data.displayName}
						<span class="user-name">{data.displayName}</span>
					{/if}
				</div>
				<form action="/api/logout" method="POST">
					<button type="submit" class="btn-nav-ghost">Sign out</button>
				</form>
			{:else}
				<a href="/api/auth/spotify" class="btn-nav-spotify">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8 1.6C4.47 1.6 1.6 4.47 1.6 8s2.87 6.4 6.4 6.4S14.4 11.53 14.4 8 11.53 1.6 8 1.6zm2.93 9.23c-.13.2-.4.27-.6.14C8.66 9.84 6.55 9.6 4.04 10.17c-.24.06-.48-.1-.53-.34-.05-.24.09-.48.33-.54 2.75-.63 5.14-.36 7.08.96.2.13.27.4.01.58zm.78-1.76c-.16.26-.5.34-.76.18-1.9-1.17-4.8-1.5-7.06-.83-.28.09-.59-.07-.67-.36-.09-.29.07-.59.36-.67 2.57-.78 5.76-.4 7.96.95.26.17.34.5.17.73zm.07-1.83c-2.28-1.35-6.04-1.47-8.22-.82-.33.1-.68-.09-.78-.42-.1-.33.09-.68.42-.78 2.5-.76 6.66-.61 9.28.94.3.18.4.57.22.87-.18.3-.57.4-.92.21z"/>
					</svg>
					Connect Spotify
				</a>
			{/if}
		</div>
	</nav>

	<!-- Main content -->
	<main class="main-content">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="footer">
		<p>Brewify uses <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer">Spotify</a>, <a href="https://www.thecocktaildb.com" target="_blank" rel="noopener noreferrer">TheCocktailDB</a>, and <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer">Claude AI</a></p>
	</footer>
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	/* Ambient background */
	.ambient-blob {
		position: fixed;
		border-radius: 50%;
		filter: blur(100px);
		pointer-events: none;
		z-index: 0;
		opacity: 0.6;
	}

	.blob-1 {
		width: 600px;
		height: 400px;
		background: radial-gradient(ellipse, rgba(255, 85, 51, 0.08) 0%, transparent 70%);
		top: -100px;
		left: -100px;
		animation: blobFloat1 20s ease-in-out infinite;
	}

	.blob-2 {
		width: 500px;
		height: 500px;
		background: radial-gradient(ellipse, rgba(186, 255, 75, 0.06) 0%, transparent 70%);
		bottom: -100px;
		right: -100px;
		animation: blobFloat2 25s ease-in-out infinite;
	}

	@keyframes blobFloat1 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		33% { transform: translate(60px, 30px) scale(1.05); }
		66% { transform: translate(-30px, 60px) scale(0.95); }
	}

	@keyframes blobFloat2 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		33% { transform: translate(-40px, -20px) scale(1.03); }
		66% { transform: translate(50px, -40px) scale(0.97); }
	}

	/* Nav */
	.nav {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 32px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.nav-logo {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: #FAFAF0;
		transition: opacity 0.2s ease;
	}

	.nav-logo:hover {
		opacity: 0.8;
	}

	.logo-icon {
		font-size: 22px;
		line-height: 1;
		color: #FF5533;
	}

	.logo-text {
		font-family: "Syne", sans-serif;
		font-size: 20px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.user-avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.user-name {
		font-size: 14px;
		color: rgba(250, 250, 240, 0.6);
	}

	.btn-nav-spotify {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 9px 18px;
		background: #1DB954;
		color: white;
		border-radius: 100px;
		font-family: "Outfit", sans-serif;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.btn-nav-spotify:hover {
		background: #1ed660;
		box-shadow: 0 0 20px rgba(29, 185, 84, 0.3);
		transform: translateY(-1px);
	}

	.btn-nav-ghost {
		padding: 8px 16px;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(250, 250, 240, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 100px;
		font-family: "Outfit", sans-serif;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-nav-ghost:hover {
		background: rgba(255, 255, 255, 0.09);
		color: rgba(250, 250, 240, 0.8);
	}

	/* Main */
	.main-content {
		position: relative;
		z-index: 1;
		flex: 1;
		padding: 0 24px 60px;
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
	}

	/* Footer */
	.footer {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 20px 24px;
		font-size: 13px;
		color: rgba(250, 250, 240, 0.25);
		border-top: 1px solid rgba(255, 255, 255, 0.04);
	}

	.footer a {
		color: rgba(250, 250, 240, 0.35);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.footer a:hover {
		color: rgba(250, 250, 240, 0.65);
	}

	@media (max-width: 640px) {
		.nav {
			padding: 16px 20px;
		}

		.user-name {
			display: none;
		}

		.main-content {
			padding: 0 16px 48px;
		}
	}
</style>
