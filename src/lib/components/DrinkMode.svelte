<script lang="ts">
	import type { DrinkToPlaylistResponse } from '$lib/types';
	import PlaylistResult from './PlaylistResult.svelte';

	let drinkInput = $state('');
	let loading = $state(false);
	let result = $state<DrinkToPlaylistResponse | null>(null);
	let errorMsg = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!drinkInput.trim() || loading) return;

		loading = true;
		result = null;
		errorMsg = '';

		try {
			const res = await fetch('/api/drink-to-playlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ drink: drinkInput.trim() })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Something went wrong' }));
				throw new Error(err.message ?? `Error ${res.status}`);
			}

			result = await res.json() as DrinkToPlaylistResponse;
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function reset() {
		result = null;
		errorMsg = '';
		drinkInput = '';
	}

	const drinkExamples = [
		'iced oat milk latte',
		'a glass of malbec',
		'cold brew with oat milk',
		'dirty gin martini',
		'matcha latte',
		'aged scotch on the rocks'
	];

	let placeholderIndex = $state(0);

	// Cycle through placeholder examples
	$effect(() => {
		const interval = setInterval(() => {
			placeholderIndex = (placeholderIndex + 1) % drinkExamples.length;
		}, 3000);
		return () => clearInterval(interval);
	});
</script>

<div class="drink-mode">
	{#if !result}
		<!-- Input form -->
		<div class="mode-intro animate-fade-up">
			<div class="mode-icon">🍹</div>
			<div>
				<h2 class="mode-title">What are you drinking?</h2>
				<p class="mode-subtitle">Describe your drink and we'll find the perfect playlist.</p>
			</div>
		</div>

		<form onsubmit={handleSubmit} class="input-form animate-fade-up delay-100">
			<div class="input-wrapper">
				<input
					type="text"
					bind:value={drinkInput}
					placeholder="e.g. {drinkExamples[placeholderIndex]}"
					class="input-field input-drink"
					maxlength="200"
					disabled={loading}
					autocomplete="off"

				/>
				<button
					type="submit"
					class="submit-btn btn-drink"
					disabled={!drinkInput.trim() || loading}
				>
					{#if loading}
						<div class="spinner"></div>
						<span>Vibing...</span>
					{:else}
						<span>Generate Playlist</span>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{/if}
				</button>
			</div>
		</form>

		<!-- Example chips -->
		{#if !loading}
			<div class="examples animate-fade-up delay-200">
				<span class="examples-label">Try:</span>
				{#each drinkExamples.slice(0, 4) as example}
					<button
						class="example-chip"
						onclick={() => { drinkInput = example; }}
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
				<p class="loading-text">Analyzing the vibe of your drink...</p>
				<p class="loading-sub">Building your playlist with Spotify</p>
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
			<div class="result-drink-label">
				<span class="drink-emoji">🍹</span>
				<span>"{drinkInput}"</span>
			</div>
			<button class="btn-ghost btn" onclick={reset}>Try another</button>
		</div>

		<PlaylistResult playlist={result.playlist} tracks={result.tracks} />
	{/if}
</div>

<style>
	.drink-mode {
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

	.input-drink:focus {
		border-color: rgba(255, 85, 51, 0.4);
		box-shadow: 0 0 0 3px rgba(255, 85, 51, 0.1);
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

	.btn-drink {
		background: #FF5533;
		color: white;
	}

	.btn-drink:hover:not(:disabled) {
		background: #ff6644;
		box-shadow: 0 0 30px rgba(255, 85, 51, 0.4);
		transform: translateY(-1px);
	}

	.btn-drink:disabled {
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
		background: rgba(255, 85, 51, 0.1);
		border-color: rgba(255, 85, 51, 0.25);
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
		border: 2px solid rgba(255, 85, 51, 0.15);
		border-top-color: #FF5533;
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

	.result-drink-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		color: rgba(250, 250, 240, 0.55);
		font-style: italic;
	}

	.drink-emoji {
		font-style: normal;
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

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
</style>
