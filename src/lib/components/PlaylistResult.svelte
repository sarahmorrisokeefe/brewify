<script lang="ts">
	import type { PlaylistResult, SpotifyTrack } from '$lib/types';

	interface Props {
		playlist: PlaylistResult;
		tracks: SpotifyTrack[];
	}

	let { playlist, tracks }: Props = $props();

	function formatDuration(ms: number): string {
		const mins = Math.floor(ms / 60000);
		const secs = Math.floor((ms % 60000) / 1000);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	const energyLabel: Record<string, string> = {
		low: '🌙 Low energy',
		medium: '✨ Mid energy',
		high: '⚡ High energy'
	};
</script>

<div class="playlist-result animate-fade-up">
	<!-- Header -->
	<div class="result-header">
		<div class="playlist-icon">
			<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
				<rect width="32" height="32" rx="8" fill="#1DB954" fill-opacity="0.15"/>
				<path d="M16 6C10.48 6 6 10.48 6 16s4.48 10 10 10 10-4.48 10-10S21.52 6 16 6zm4.62 14.44c-.2.32-.62.42-.94.22-2.58-1.58-5.84-1.94-9.68-1.06-.36.08-.72-.14-.8-.5-.08-.36.14-.72.5-.8 4.2-.96 7.8-.54 10.7 1.22.32.2.42.62.22.92zm1.24-2.74c-.24.4-.76.52-1.16.28-2.96-1.82-7.46-2.34-10.96-1.28-.44.14-.9-.1-1.04-.54-.14-.44.1-.9.54-1.04 4-1.22 8.96-.62 12.36 1.46.4.24.52.76.26 1.12zm.1-2.84c-3.54-2.1-9.38-2.3-12.76-1.26-.52.16-1.08-.14-1.24-.66-.16-.52.14-1.08.66-1.24 3.9-1.18 10.38-.96 14.46 1.46.48.28.64.9.36 1.38-.28.46-.88.62-1.38.32h-.1z" fill="#1DB954"/>
			</svg>
		</div>
		<div class="playlist-info">
			<p class="playlist-label">Playlist created</p>
			<h2 class="playlist-name">{playlist.name}</h2>
			{#if playlist.vibe}
				<p class="playlist-vibe">"{playlist.vibe}"</p>
			{/if}
		</div>
		{#if playlist.energy}
			<span class="energy-tag">{energyLabel[playlist.energy] ?? playlist.energy}</span>
		{/if}
	</div>

	{#if playlist.description}
		<p class="playlist-description">{playlist.description}</p>
	{/if}

	<!-- Track count -->
	<div class="track-count">
		<span>{tracks.length} tracks</span>
	</div>

	<!-- Track list -->
	<div class="track-list">
		{#each tracks as track, i}
			<a
				href={track.external_urls.spotify}
				target="_blank"
				rel="noopener noreferrer"
				class="track-row animate-fade-up"
				style="animation-delay: {Math.min(i * 40, 800)}ms; opacity: 0;"
			>
				<span class="track-num">{i + 1}</span>
				{#if track.album?.images?.[0]?.url}
					<img
						src={track.album.images[0].url}
						alt={track.album.name}
						class="track-thumb"
						loading="lazy"
					/>
				{:else}
					<div class="track-thumb track-thumb-placeholder">♪</div>
				{/if}
				<div class="track-info">
					<span class="track-name">{track.name}</span>
					<span class="track-artist">{track.artists.map((a) => a.name).join(', ')}</span>
				</div>
				<div class="track-meta">
					<span class="track-album">{track.album?.name}</span>
					<span class="track-duration">{formatDuration(track.duration_ms)}</span>
				</div>
				<svg class="track-link-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M2 12L12 2M12 2H6M12 2v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		{/each}
	</div>

	<!-- CTA -->
	<div class="result-footer">
		<a
			href={playlist.external_urls.spotify}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-spotify"
		>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
				<path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.66 11.54c-.16.26-.5.34-.76.18-2.08-1.27-4.7-1.56-7.78-.86-.3.07-.6-.12-.66-.42-.07-.3.12-.6.42-.66 3.38-.77 6.28-.44 8.6.98.26.16.34.5.18.78zm.98-2.2c-.2.32-.62.42-.94.22-2.38-1.46-6.01-1.88-8.82-1.03-.36.11-.74-.09-.85-.45-.11-.36.09-.74.45-.85 3.2-.97 7.18-.5 9.92 1.18.32.2.42.62.24.93zm.08-2.28C11.54 7.38 7 7.2 4.42 8.01c-.42.13-.87-.11-.99-.53-.13-.42.11-.87.53-.99 2.98-.91 7.95-.73 11.08 1.16.38.23.5.72.27 1.1-.22.38-.72.5-1.1.27l.01-.06z"/>
			</svg>
			Open in Spotify
		</a>
		<p class="save-note">✓ Saved to your Spotify library</p>
	</div>
</div>

<style>
	.playlist-result {
		background: rgba(29, 185, 84, 0.04);
		border: 1px solid rgba(29, 185, 84, 0.15);
		border-radius: 20px;
		padding: 28px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.result-header {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	.playlist-icon {
		flex-shrink: 0;
	}

	.playlist-info {
		flex: 1;
		min-width: 0;
	}

	.playlist-label {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1DB954;
		margin-bottom: 4px;
	}

	.playlist-name {
		font-family: "Syne", sans-serif;
		font-size: 26px;
		font-weight: 800;
		color: #FAFAF0;
		line-height: 1.15;
		margin: 0 0 6px;
	}

	.playlist-vibe {
		font-size: 14px;
		color: rgba(250, 250, 240, 0.45);
		font-style: italic;
	}

	.energy-tag {
		flex-shrink: 0;
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 100px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(250, 250, 240, 0.6);
		white-space: nowrap;
	}

	.playlist-description {
		font-size: 15px;
		line-height: 1.6;
		color: rgba(250, 250, 240, 0.6);
		padding: 0 4px;
	}

	.track-count {
		font-size: 13px;
		font-weight: 600;
		color: rgba(250, 250, 240, 0.35);
		letter-spacing: 0.04em;
		padding-bottom: 4px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.track-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-height: 420px;
		overflow-y: auto;
	}

	.track-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 10px;
		border-radius: 10px;
		text-decoration: none;
		transition: background 0.15s ease;
		color: inherit;
	}

	.track-row:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.track-row:hover .track-link-icon {
		opacity: 1;
	}

	.track-num {
		min-width: 24px;
		text-align: right;
		font-size: 13px;
		color: rgba(250, 250, 240, 0.3);
		font-feature-settings: "tnum";
	}

	.track-thumb {
		width: 40px;
		height: 40px;
		border-radius: 6px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.track-thumb-placeholder {
		background: rgba(255, 255, 255, 0.06);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		color: rgba(250, 250, 240, 0.3);
	}

	.track-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.track-name {
		font-size: 14px;
		font-weight: 500;
		color: #FAFAF0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.track-artist {
		font-size: 12px;
		color: rgba(250, 250, 240, 0.45);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.track-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
		flex-shrink: 0;
	}

	.track-album {
		font-size: 12px;
		color: rgba(250, 250, 240, 0.3);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 120px;
		text-align: right;
	}

	.track-duration {
		font-size: 12px;
		color: rgba(250, 250, 240, 0.4);
		font-feature-settings: "tnum";
	}

	.track-link-icon {
		color: rgba(250, 250, 240, 0.3);
		opacity: 0;
		transition: opacity 0.15s ease;
		flex-shrink: 0;
	}

	.result-footer {
		display: flex;
		align-items: center;
		gap: 16px;
		padding-top: 4px;
		flex-wrap: wrap;
	}

	.save-note {
		font-size: 13px;
		color: #1DB954;
		font-weight: 500;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 24px;
		border-radius: 100px;
		font-family: "Outfit", sans-serif;
		font-weight: 600;
		font-size: 15px;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		text-decoration: none;
	}

	.btn-spotify {
		background: #1DB954;
		color: white;
	}

	.btn-spotify:hover {
		background: #1ed660;
		box-shadow: 0 0 24px rgba(29, 185, 84, 0.35);
		transform: translateY(-1px);
	}

	@media (max-width: 640px) {
		.track-album {
			display: none;
		}

		.energy-tag {
			display: none;
		}

		.playlist-name {
			font-size: 22px;
		}
	}
</style>
