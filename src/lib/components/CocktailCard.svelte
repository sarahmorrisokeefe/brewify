<script lang="ts">
	import type { CocktailRecipe } from '$lib/types';

	interface Props {
		cocktail: CocktailRecipe;
		index?: number;
	}

	let { cocktail, index = 0 }: Props = $props();

	let expanded = $state(false);

	const instructionSteps = $derived(
		cocktail.instructions
			.split(/\.\s+|\n+/)
			.map((s) => s.trim())
			.filter((s) => s.length > 5)
	);

	const isAlcoholic = $derived(
		cocktail.alcoholic.toLowerCase() !== 'non alcoholic' &&
			cocktail.alcoholic.toLowerCase() !== 'non_alcoholic'
	);
</script>

<div
	class="cocktail-card animate-fade-up"
	style="animation-delay: {index * 120}ms; opacity: 0;"
>
	<!-- Image -->
	<div class="card-image">
		{#if cocktail.imageUrl}
			<img
				src="{cocktail.imageUrl}/preview"
				alt={cocktail.name}
				loading="lazy"
			/>
		{:else}
			<div class="image-placeholder">🍹</div>
		{/if}
		<div class="image-overlay">
			<span class="tag {isAlcoholic ? 'tag-alcoholic' : 'tag-non-alcoholic'}">
				{isAlcoholic ? '🥃 Alcoholic' : '🌿 Non-Alcoholic'}
			</span>
		</div>
	</div>

	<!-- Content -->
	<div class="card-content">
		<div class="card-header">
			<div>
				<h3 class="card-name">{cocktail.name}</h3>
				<p class="card-meta">
					{cocktail.glass}
					{#if cocktail.category}
						· {cocktail.category}
					{/if}
				</p>
			</div>
		</div>

		<!-- Ingredients -->
		<div class="ingredients-section">
			<h4 class="section-label">Ingredients</h4>
			<ul class="ingredients-list">
				{#each cocktail.ingredients as ingredient}
					<li class="ingredient-item">
						<span class="ingredient-measure">{ingredient.measure || '–'}</span>
						<span class="ingredient-name">{ingredient.name}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Instructions toggle -->
		<button class="instructions-toggle" onclick={() => (expanded = !expanded)}>
			<span>Instructions</span>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				style="transform: rotate({expanded ? 180 : 0}deg); transition: transform 0.25s ease"
			>
				<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		{#if expanded}
			<ol class="instructions-list animate-fade-in">
				{#each instructionSteps as step, i}
					<li class="instruction-step">
						<span class="step-number">{i + 1}</span>
						<span class="step-text">{step}{step.endsWith('.') ? '' : '.'}</span>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</div>

<style>
	.cocktail-card {
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		overflow: hidden;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.cocktail-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
		border-color: rgba(255, 255, 255, 0.14);
	}

	.card-image {
		position: relative;
		width: 100%;
		aspect-ratio: 4/3;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.03);
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.cocktail-card:hover .card-image img {
		transform: scale(1.04);
	}

	.image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48px;
		background: linear-gradient(135deg, rgba(240, 165, 0, 0.08), rgba(255, 85, 51, 0.08));
	}

	.image-overlay {
		position: absolute;
		top: 12px;
		left: 12px;
	}

	.card-content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.card-name {
		font-family: "Syne", sans-serif;
		font-size: 20px;
		font-weight: 700;
		color: #FAFAF0;
		margin: 0 0 4px;
		line-height: 1.2;
	}

	.card-meta {
		font-size: 13px;
		color: rgba(250, 250, 240, 0.4);
		font-weight: 400;
	}

	.section-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(250, 250, 240, 0.35);
		margin-bottom: 10px;
	}

	.ingredients-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ingredient-item {
		display: flex;
		align-items: baseline;
		gap: 10px;
		font-size: 14px;
	}

	.ingredient-measure {
		min-width: 72px;
		color: #F0A500;
		font-weight: 600;
		font-size: 13px;
		flex-shrink: 0;
	}

	.ingredient-name {
		color: rgba(250, 250, 240, 0.85);
	}

	.instructions-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 10px 14px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		color: rgba(250, 250, 240, 0.6);
		font-family: "Outfit", sans-serif;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.instructions-toggle:hover {
		background: rgba(255, 255, 255, 0.07);
		color: #FAFAF0;
	}

	.instructions-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.instruction-step {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}

	.step-number {
		min-width: 24px;
		height: 24px;
		border-radius: 50%;
		background: rgba(240, 165, 0, 0.15);
		border: 1px solid rgba(240, 165, 0, 0.25);
		color: #F0A500;
		font-size: 12px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 1px;
	}

	.step-text {
		font-size: 14px;
		line-height: 1.55;
		color: rgba(250, 250, 240, 0.7);
	}

	/* Alcoholic/non-alcoholic tags */
	.tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		border-radius: 100px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.04em;
		backdrop-filter: blur(8px);
	}

	.tag-alcoholic {
		background: rgba(240, 165, 0, 0.2);
		color: #F0A500;
		border: 1px solid rgba(240, 165, 0, 0.3);
	}

	.tag-non-alcoholic {
		background: rgba(186, 255, 75, 0.15);
		color: #BAFF4B;
		border: 1px solid rgba(186, 255, 75, 0.25);
	}
</style>
