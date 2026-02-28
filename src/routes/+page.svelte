<script lang="ts">
	import type { PageData } from './$types';
	import DrinkMode from '$lib/components/DrinkMode.svelte';
	import MusicMode from '$lib/components/MusicMode.svelte';

	let { data }: { data: PageData } = $props();

	let activeMode = $state<'drink' | 'music' | null>(null);

	function selectMode(mode: 'drink' | 'music') {
		activeMode = mode;
		// Scroll to content
		setTimeout(() => {
			document.getElementById('mode-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
	}

	function backToHome() {
		activeMode = null;
	}
</script>

<svelte:head>
	<title>Brewify — Drinks meet music</title>
</svelte:head>

<div class="page">
	<!-- Hero -->
	<header class="hero">
		<div class="hero-eyebrow animate-fade-up">
			<span class="eyebrow-dot drink-dot"></span>
			<span>drinks × music</span>
			<span class="eyebrow-dot music-dot"></span>
		</div>
		<h1 class="hero-title animate-fade-up delay-100">
			Every sip has a<br />
			<span class="title-gradient">soundtrack.</span>
		</h1>
		<p class="hero-sub animate-fade-up delay-200">
			Tell us what you're drinking and we'll find the playlist.<br class="hide-mobile" />
			Tell us what you're hearing and we'll find the drink.
		</p>
	</header>

	<!-- Auth gate -->
	{#if !data.isAuthenticated}
		<div class="auth-gate animate-fade-up delay-300">
			<div class="auth-card">
				<div class="auth-icon">
					<svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor" style="color: #1DB954">
						<path d="M14 2.8C7.836 2.8 2.8 7.836 2.8 14s5.036 11.2 11.2 11.2S25.2 20.164 25.2 14 20.164 2.8 14 2.8zm5.124 16.156c-.224.364-.7.476-1.064.252-2.912-1.778-6.58-2.184-10.892-1.19-.42.098-1.008-.168-.896-.588.098-.42.476-.644.896-.742 4.732-1.078 8.792-.616 12.012 1.372.364.224.476.7.252 1.064l-.308-.168zm1.372-3.052c-.28.448-.868.588-1.316.308-3.332-2.044-8.4-2.632-12.348-1.456-.504.154-1.022-.126-1.162-.616-.154-.504.126-1.022.616-1.162 4.508-1.372 10.108-.7 13.944 1.652.448.28.588.868.266 1.274zm.126-3.22c-4.004-2.38-10.612-2.604-14.434-1.428-.588.182-1.204-.154-1.386-.742-.182-.588.154-1.204.742-1.386 4.396-1.33 11.704-1.078 16.324 1.652.532.308.714 1.008.406 1.54-.308.518-1.008.714-1.652.364z"/>
					</svg>
				</div>
				<div class="auth-text">
					<h3>Connect Spotify to get started</h3>
					<p>Brewify needs Spotify to create and save playlists to your library.</p>
				</div>
				<a href="/api/auth/spotify" class="btn-spotify-cta">
					<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
						<path d="M9 1.8C5.028 1.8 1.8 5.028 1.8 9s3.228 7.2 7.2 7.2S16.2 12.972 16.2 9 12.972 1.8 9 1.8zm3.303 10.382c-.144.234-.45.306-.684.162-1.872-1.143-4.23-1.402-7.002-.767-.27.063-.54-.108-.594-.378-.063-.27.108-.54.378-.594 3.033-.693 5.634-.396 7.74 1.386l-.072-.252c.234-.36.576.144.234.243zm.882-1.962c-.18.288-.558.378-.846.198-2.142-1.314-5.4-1.692-7.938-.927-.315.099-.648-.09-.738-.405-.099-.315.09-.648.405-.738 2.88-.873 6.462-.45 8.919 1.044.288.18.378.558.198.828zm.081-2.043c-2.565-1.521-6.804-1.665-9.261-.918-.369.117-.765-.099-.882-.468-.117-.369.099-.765.468-.882 2.817-.855 7.497-.693 10.458 1.053.333.198.441.63.243.963-.198.333-.63.441-.963.243l-.063-.009z"/>
					</svg>
					Connect with Spotify
				</a>
			</div>
		</div>
	{:else}
		<!-- Mode selector -->
		{#if !activeMode}
			<div class="mode-grid animate-fade-up delay-300">
				<!-- Drink mode card -->
				<button class="mode-card mode-drink" onclick={() => selectMode('drink')}>
					<div class="mode-card-bg"></div>
					<div class="mode-card-content">
						<div class="mode-card-icon">🍹</div>
						<div class="mode-card-body">
							<h2 class="mode-card-title">I'm drinking...</h2>
							<p class="mode-card-desc">Describe your drink, get a playlist that matches the vibe.</p>
						</div>
						<div class="mode-card-arrow">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>
					<div class="mode-card-tag">Drink → Playlist</div>
				</button>

				<!-- Music mode card -->
				<button class="mode-card mode-music" onclick={() => selectMode('music')}>
					<div class="mode-card-bg"></div>
					<div class="mode-card-content">
						<div class="mode-card-icon">🎧</div>
						<div class="mode-card-body">
							<h2 class="mode-card-title">I'm listening to...</h2>
							<p class="mode-card-desc">Share an artist, album, or playlist — get 3 perfect cocktails.</p>
						</div>
						<div class="mode-card-arrow">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>
					<div class="mode-card-tag">Music → Drink</div>
				</button>
			</div>

			<!-- How it works -->
			<div class="how-it-works animate-fade-up delay-400">
				<div class="how-item">
					<span class="how-num">01</span>
					<p>Tell Brewify what you're drinking or listening to</p>
				</div>
				<div class="how-divider"></div>
				<div class="how-item">
					<span class="how-num">02</span>
					<p>Claude AI reads the vibe and finds the perfect pairing</p>
				</div>
				<div class="how-divider"></div>
				<div class="how-item">
					<span class="how-num">03</span>
					<p>Your playlist is saved to Spotify, or your cocktail recipe is ready to mix</p>
				</div>
			</div>
		{:else}
			<!-- Active mode -->
			<div id="mode-content" class="mode-content">
				<!-- Mode switcher tab -->
				<div class="mode-tabs animate-fade-in">
					<button
						class="mode-tab {activeMode === 'drink' ? 'tab-drink active' : ''}"
						onclick={() => selectMode('drink')}
					>
						<span>🍹</span> I'm drinking...
					</button>
					<button
						class="mode-tab {activeMode === 'music' ? 'tab-music active' : ''}"
						onclick={() => selectMode('music')}
					>
						<span>🎧</span> I'm listening...
					</button>
					<button class="back-btn" onclick={backToHome}>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						Home
					</button>
				</div>

				<!-- Mode panel -->
				<div class="mode-panel {activeMode === 'drink' ? 'panel-drink' : 'panel-music'}">
					{#if activeMode === 'drink'}
						<DrinkMode />
					{:else}
						<MusicMode />
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page {
		padding-top: 48px;
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	/* Hero */
	.hero {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.hero-eyebrow {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(250, 250, 240, 0.35);
	}

	.eyebrow-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}

	.drink-dot { background: #FF5533; }
	.music-dot { background: #BAFF4B; }

	.hero-title {
		font-family: "Syne", sans-serif;
		font-size: clamp(40px, 7vw, 72px);
		font-weight: 800;
		line-height: 1.1;
		color: #FAFAF0;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.title-gradient {
		background: linear-gradient(135deg, #FF5533 0%, #F0A500 40%, #BAFF4B 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-sub {
		font-size: 17px;
		line-height: 1.65;
		color: rgba(250, 250, 240, 0.5);
		max-width: 520px;
	}

	/* Auth gate */
	.auth-gate {
		display: flex;
		justify-content: center;
	}

	.auth-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 24px 32px;
		background: rgba(29, 185, 84, 0.05);
		border: 1px solid rgba(29, 185, 84, 0.15);
		border-radius: 20px;
		max-width: 680px;
		width: 100%;
		flex-wrap: wrap;
	}

	.auth-icon {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		border-radius: 12px;
		background: rgba(29, 185, 84, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.auth-text {
		flex: 1;
		min-width: 200px;
	}

	.auth-text h3 {
		font-family: "Syne", sans-serif;
		font-size: 18px;
		font-weight: 700;
		color: #FAFAF0;
		margin: 0 0 4px;
	}

	.auth-text p {
		font-size: 14px;
		color: rgba(250, 250, 240, 0.5);
		margin: 0;
	}

	.btn-spotify-cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		background: #1DB954;
		color: white;
		border-radius: 100px;
		font-family: "Outfit", sans-serif;
		font-size: 15px;
		font-weight: 700;
		text-decoration: none;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.btn-spotify-cta:hover {
		background: #1ed660;
		box-shadow: 0 0 28px rgba(29, 185, 84, 0.35);
		transform: translateY(-1px);
	}

	/* Mode grid */
	.mode-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.mode-card {
		position: relative;
		padding: 32px;
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
		cursor: pointer;
		text-align: left;
		transition: all 0.25s ease;
		overflow: hidden;
	}

	.mode-card-bg {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: inherit;
	}

	.mode-drink .mode-card-bg {
		background: radial-gradient(ellipse at top left, rgba(255, 85, 51, 0.12) 0%, transparent 60%);
	}

	.mode-music .mode-card-bg {
		background: radial-gradient(ellipse at top left, rgba(186, 255, 75, 0.1) 0%, transparent 60%);
	}

	.mode-card:hover .mode-card-bg {
		opacity: 1;
	}

	.mode-drink:hover {
		border-color: rgba(255, 85, 51, 0.3);
		box-shadow: 0 20px 60px rgba(255, 85, 51, 0.08);
		transform: translateY(-4px);
	}

	.mode-music:hover {
		border-color: rgba(186, 255, 75, 0.25);
		box-shadow: 0 20px 60px rgba(186, 255, 75, 0.06);
		transform: translateY(-4px);
	}

	.mode-card-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.mode-card-icon {
		font-size: 48px;
		line-height: 1;
	}

	.mode-card-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.mode-card-title {
		font-family: "Syne", sans-serif;
		font-size: 24px;
		font-weight: 800;
		color: #FAFAF0;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.mode-card-desc {
		font-size: 14px;
		line-height: 1.55;
		color: rgba(250, 250, 240, 0.5);
		margin: 0;
	}

	.mode-card-arrow {
		color: rgba(250, 250, 240, 0.3);
		transition: all 0.2s ease;
		align-self: flex-end;
	}

	.mode-drink:hover .mode-card-arrow { color: #FF5533; transform: translateX(4px); }
	.mode-music:hover .mode-card-arrow { color: #BAFF4B; transform: translateX(4px); }

	.mode-card-tag {
		position: absolute;
		top: 16px;
		right: 16px;
		z-index: 1;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 4px 10px;
		border-radius: 100px;
	}

	.mode-drink .mode-card-tag {
		color: #FF5533;
		background: rgba(255, 85, 51, 0.1);
		border: 1px solid rgba(255, 85, 51, 0.2);
	}

	.mode-music .mode-card-tag {
		color: #BAFF4B;
		background: rgba(186, 255, 75, 0.08);
		border: 1px solid rgba(186, 255, 75, 0.18);
	}

	/* How it works */
	.how-it-works {
		display: flex;
		align-items: center;
		gap: 0;
		padding: 28px 32px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 16px;
	}

	.how-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 0 16px;
		text-align: center;
	}

	.how-num {
		font-family: "Syne", sans-serif;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: rgba(250, 250, 240, 0.2);
	}

	.how-item p {
		font-size: 13px;
		line-height: 1.5;
		color: rgba(250, 250, 240, 0.4);
	}

	.how-divider {
		width: 1px;
		height: 48px;
		background: rgba(255, 255, 255, 0.06);
		flex-shrink: 0;
	}

	/* Active mode content */
	.mode-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.mode-tabs {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.mode-tab {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		border-radius: 100px;
		font-family: "Outfit", sans-serif;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.04);
		color: rgba(250, 250, 240, 0.45);
		transition: all 0.2s ease;
	}

	.tab-drink.active {
		background: rgba(255, 85, 51, 0.12);
		border-color: rgba(255, 85, 51, 0.3);
		color: #FF5533;
	}

	.tab-music.active {
		background: rgba(186, 255, 75, 0.1);
		border-color: rgba(186, 255, 75, 0.25);
		color: #BAFF4B;
	}

	.mode-tab:hover:not(.active) {
		background: rgba(255, 255, 255, 0.07);
		color: rgba(250, 250, 240, 0.7);
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 8px 14px;
		background: transparent;
		border: none;
		color: rgba(250, 250, 240, 0.3);
		font-family: "Outfit", sans-serif;
		font-size: 13px;
		cursor: pointer;
		transition: color 0.15s ease;
		margin-left: auto;
	}

	.back-btn:hover {
		color: rgba(250, 250, 240, 0.6);
	}

	.mode-panel {
		padding: 32px;
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.07);
	}

	.panel-drink {
		background: linear-gradient(160deg, rgba(255, 85, 51, 0.04) 0%, rgba(255, 255, 255, 0.02) 50%);
		border-color: rgba(255, 85, 51, 0.12);
	}

	.panel-music {
		background: linear-gradient(160deg, rgba(186, 255, 75, 0.04) 0%, rgba(255, 255, 255, 0.02) 50%);
		border-color: rgba(186, 255, 75, 0.1);
	}

	/* Animations */
	.animate-fade-up {
		animation: fadeUp 0.6s ease forwards;
		opacity: 0;
	}

	.animate-fade-in {
		animation: fadeIn 0.35s ease forwards;
	}

	.delay-100 { animation-delay: 80ms; }
	.delay-200 { animation-delay: 160ms; }
	.delay-300 { animation-delay: 240ms; }
	.delay-400 { animation-delay: 320ms; }

	@keyframes fadeUp {
		from { opacity: 0; transform: translateY(24px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Mobile */
	.hide-mobile {
		display: block;
	}

	@media (max-width: 640px) {
		.page {
			padding-top: 32px;
			gap: 32px;
		}

		.hero-title {
			font-size: 40px;
		}

		.mode-grid {
			grid-template-columns: 1fr;
		}

		.mode-card {
			padding: 24px;
		}

		.mode-card-title {
			font-size: 20px;
		}

		.how-it-works {
			flex-direction: column;
			gap: 20px;
			padding: 24px;
		}

		.how-divider {
			width: 48px;
			height: 1px;
		}

		.mode-panel {
			padding: 20px;
		}

		.auth-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.hide-mobile {
			display: none;
		}
	}
</style>
