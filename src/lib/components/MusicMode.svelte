<script lang="ts">
	import type { MusicToDrinkResponse, CocktailRecipe } from '$lib/types';
	import CocktailCard from './CocktailCard.svelte';

	let musicInput = $state('');
	let loading = $state(false);
	let result = $state<MusicToDrinkResponse | null>(null);
	let errorMsg = $state('');
	let filterAlcoholic = $state<'all' | 'alcoholic' | 'non-alcoholic'>('all');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!musicInput.trim() || loading) return;

		loading = true;
		result = null;
		errorMsg = '';

		try {
			const res = await fetch('/api/music-to-drink', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ musicInput: musicInput.trim() })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Something went wrong' }));
				throw new Error(err.message ?? `Error ${res.status}`);
			}

			result = await res.json() as MusicToDrinkResponse;
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function reset() {
		result = null;
		errorMsg = '';
		musicInput = '';
		filterAlcoholic = 'all';
	}

	const filteredCocktails = $derived(
		result?.cocktails.filter((c: CocktailRecipe) => {
			if (filterAlcoholic === 'all') return true;
			const isAlcoholic = c.alcoholic.toLowerCase() !== 'non alcoholic' &&
				c.alcoholic.toLowerCase() !== 'non_alcoholic';
			return filterAlcoholic === 'alcoholic' ? isAlcoholic : !isAlcoholic;
		}) ?? []
	);

	const musicExamples = [
		'https://open.spotify.com/playlist/...',
		'Kendrick Lamar',
		'Fleetwood Mac - Rumours',
		'Tame Impala',
		'My favorite lo-fi playlist',
		'80s synth pop vibes'
	];
</script>

<div class="music-mode">
	{#if !result}
		<!-- Input form -->
		<div class="mode-intro animate-fade-up">
			<div class="mode-icon">🎧</div>
			<div>
				<h2 class="mode-title">What are you listening to?</h2>
				<p class="mode-subtitle">Share a Spotify playlist, artist, or album and get drink pairings.</p>
			</div>
		</div>

		<form onsubmit={handleSubmit} class="input-form animate-fade-up delay-100">
			<div class="input-wrapper">
				<input
					type="text"
					bind:value={musicInput}
					placeholder="Artist name, album, or Spotify playlist URL"
					class="input-field input-music"
					maxlength="500"
					disabled={loading}
					autocomplete="off"

				/>
				<button
					type="submit"
					class="submit-btn btn-music"
					disabled={!musicInput.trim() || loading}
				>
					{#if loading}
						<div class="spinner-dark"></div>
						<span>Pairing...</span>
					{:else}
						<span>Find My Drinks</span>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{/if}
				</button>
			</div>
		</form>

		<!-- Examples -->
		{#if !loading}
			<div class="examples animate-fade-up delay-200">
				<span class="examples-label">Try:</span>
				{#each ['Kendrick Lamar', 'Fleetwood Mac - Rumours', 'Tame Impala', 'Late night jazz'] as example}
					<button
						class="example-chip"
						onclick={() => { musicInput = example; }}
					>
						{example}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Loading state -->
		{#if loading}
			<div class="loading-state animate-fade-in">
				<div class="loading-orb"></div>
				<p class="loading-text">Reading the musical vibe...</p>
				<p class="loading-sub">Matching cocktails to your sound</p>
			</div>
		{/if}

		<!-- Error -->
		{#if errorMsg}
			<div class="error-box animate-fade-in">
				<span>⚠️</span>
				<span>{errorMsg}</span>
			</div>
		{/if}
	{:else}
		<!-- Results -->
		<div class="result-header-bar animate-fade-in">
			<div class="result-music-label">
				<span>🎧</span>
				<span>"{musicInput.length > 50 ? musicInput.slice(0, 50) + '…' : musicInput}"</span>
			</div>
			<button class="btn-ghost btn" onclick={reset}>Try another</button>
		</div>

		<!-- Vibe + reasoning -->
		<div class="vibe-card animate-fade-up">
			<div class="vibe-header">
				<span class="vibe-label">Musical vibe</span>
				<span class="vibe-text">"{result.vibe}"</span>
			</div>
			{#if result.reasoning}
				<p class="vibe-reasoning">{result.reasoning}</p>
			{/if}
		</div>

		<!-- Filter tabs -->
		{#if result.cocktails.length > 0}
			<div class="filter-tabs animate-fade-up delay-100">
				<span class="filter-label">Filter:</span>
				{#each [['all', 'All drinks'], ['alcoholic', '🥃 Alcoholic'], ['non-alcoholic', '🌿 Non-alcoholic']] as [val, label]}
					<button
						class="filter-tab {filterAlcoholic === val ? 'active' : ''}"
						onclick={() => { filterAlcoholic = val as typeof filterAlcoholic; }}
					>
						{label}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Cocktail grid -->
		{#if filteredCocktails.length > 0}
			<div class="cocktail-grid">
				{#each filteredCocktails as cocktail, i}
					<CocktailCard {cocktail} index={i} />
				{/each}
			</div>
		{:else}
			<div class="no-results animate-fade-in">
				<p>No {filterAlcoholic === 'all' ? '' : filterAlcoholic} drinks found. Try a different filter.</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.music-mode {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 100%;
	}

	.mode-intro {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.mode-icon {
		font-size: 40px;
		flex-shrink: 0;
	}

	.mode-title {
		font-family: "Syne", sans-serif;
		font-size: 28px;
		font-weight: 800;
		color: #FAFAF0;
		margin: 0 0 4px;
	}

	.mode-subtitle {
		font-size: 15px;
		color: rgba(250, 250, 240, 0.5);
	}

	.input-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.input-wrapper {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.input-field {
		flex: 1;
		min-width: 200px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 14px 18px;
		color: #FAFAF0;
		font-family: "Outfit", sans-serif;
		font-size: 16px;
		transition: all 0.2s ease;
		outline: none;
	}

	.input-field::placeholder {
		color: rgba(250, 250, 240, 0.3);
	}

	.input-music:focus {
		border-color: rgba(186, 255, 75, 0.4);
		box-shadow: 0 0 0 3px rgba(186, 255, 75, 0.08);
		background: rgba(255, 255, 255, 0.07);
	}

	.submit-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 26px;
		border-radius: 12px;
		font-family: "Outfit", sans-serif;
		font-weight: 700;
		font-size: 15px;
		cursor: pointer;
		border: none;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.btn-music {
		background: #BAFF4B;
		color: #07070E;
	}

	.btn-music:hover:not(:disabled) {
		background: #caff6b;
		box-shadow: 0 0 30px rgba(186, 255, 75, 0.35);
		transform: translateY(-1px);
	}

	.btn-music:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.examples {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.examples-label {
		font-size: 13px;
		color: rgba(250, 250, 240, 0.35);
		font-weight: 500;
	}

	.example-chip {
		padding: 6px 14px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 100px;
		color: rgba(250, 250, 240, 0.55);
		font-family: "Outfit", sans-serif;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.example-chip:hover {
		background: rgba(186, 255, 75, 0.08);
		border-color: rgba(186, 255, 75, 0.2);
		color: rgba(250, 250, 240, 0.85);
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 40px 20px;
	}

	.loading-orb {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: 2px solid rgba(186, 255, 75, 0.15);
		border-top-color: #BAFF4B;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 16px;
		font-weight: 600;
		color: rgba(250, 250, 240, 0.8);
	}

	.loading-sub {
		font-size: 14px;
		color: rgba(250, 250, 240, 0.4);
	}

	.error-box {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 18px;
		background: rgba(255, 85, 51, 0.08);
		border: 1px solid rgba(255, 85, 51, 0.2);
		border-radius: 12px;
		font-size: 14px;
		color: rgba(250, 250, 240, 0.75);
	}

	.result-header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.result-music-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		color: rgba(250, 250, 240, 0.55);
		font-style: italic;
	}

	.vibe-card {
		background: rgba(186, 255, 75, 0.05);
		border: 1px solid rgba(186, 255, 75, 0.12);
		border-radius: 16px;
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.vibe-header {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.vibe-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(186, 255, 75, 0.7);
		flex-shrink: 0;
	}

	.vibe-text {
		font-family: "Syne", sans-serif;
		font-size: 20px;
		font-weight: 700;
		color: #BAFF4B;
		font-style: italic;
	}

	.vibe-reasoning {
		font-size: 14px;
		line-height: 1.65;
		color: rgba(250, 250, 240, 0.6);
	}

	.filter-tabs {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.filter-label {
		font-size: 13px;
		color: rgba(250, 250, 240, 0.35);
		font-weight: 500;
	}

	.filter-tab {
		padding: 6px 14px;
		border-radius: 100px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: rgba(250, 250, 240, 0.5);
		font-family: "Outfit", sans-serif;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.filter-tab:hover {
		border-color: rgba(186, 255, 75, 0.2);
		color: rgba(250, 250, 240, 0.8);
	}

	.filter-tab.active {
		background: rgba(186, 255, 75, 0.1);
		border-color: rgba(186, 255, 75, 0.25);
		color: #BAFF4B;
	}

	.cocktail-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
	}

	.no-results {
		text-align: center;
		padding: 40px 20px;
		color: rgba(250, 250, 240, 0.4);
		font-size: 15px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 20px;
		border-radius: 100px;
		font-family: "Outfit", sans-serif;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.btn-ghost {
		background: rgba(255, 255, 255, 0.06);
		color: rgba(250, 250, 240, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.btn-ghost:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #FAFAF0;
	}

	/* Animation classes */
	.animate-fade-up {
		animation: fadeUp 0.5s ease forwards;
	}

	.animate-fade-in {
		animation: fadeIn 0.3s ease forwards;
	}

	.delay-100 { animation-delay: 80ms; }
	.delay-200 { animation-delay: 160ms; }

	@keyframes fadeUp {
		from { opacity: 0; transform: translateY(16px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.spinner-dark {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(7, 7, 14, 0.3);
		border-top-color: #07070E;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
</style>
