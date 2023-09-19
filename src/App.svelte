<script lang="ts">
	import { onMount } from 'svelte';
	import Clipper from './components/clipper.svelte';

	let youtubeTab: chrome.tabs.Tab | undefined;
	let videoId: string;

	onMount(async () => {
		const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
		if (activeTab.url?.indexOf('youtube.com/watch') === -1) {
			return;
		}
		const regex = /[?&]v=([^&#]+)/;
		const match = activeTab.url?.match(regex);
		videoId = match && match[1];
		if (!videoId) {
			return;
		}
		youtubeTab = activeTab;
	});
</script>

<main>
	{#if !youtubeTab}
		<h3>Not in a youtube video tab</h3>
	{:else}
		<Clipper tab={youtubeTab} id={videoId} />
	{/if}
</main>
