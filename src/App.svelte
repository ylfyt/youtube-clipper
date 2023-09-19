<script lang="ts">
	import { onMount } from 'svelte';
	import Clipper from './components/clipper.svelte';
	import { parseVideo } from './utils/parse-video';
	import type { IVideo } from './interfaces/video';

	let youtubeTab: chrome.tabs.Tab | undefined;
	let videoId: string;

	let videos: IVideo[] | null = null;

	async function loadAllVideos() {
		const videoData = await chrome.storage.local.get();
		const ids = Object.keys(videoData);
		const temp: IVideo[] = [];
		for (const id of ids) {
			const video = parseVideo(videoData[id]);
			if (!video) continue;
			temp.push(video);
		}
		videos = temp;
	}

	onMount(async () => {
		const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
		if (activeTab.url?.indexOf('youtube.com/watch') === -1) {
			loadAllVideos();
			return;
		}
		const regex = /[?&]v=([^&#]+)/;
		const match = activeTab.url?.match(regex);
		videoId = match && match[1];
		if (!videoId) {
			loadAllVideos();
			return;
		}
		youtubeTab = activeTab;
	});

	async function removeSavedVideo(video: IVideo) {
		await chrome.storage.local.remove(video.id).then();
		videos = videos.filter((vid) => vid != video);
	}
</script>

<main>
	{#if youtubeTab}
		<Clipper tab={youtubeTab} id={videoId} />
		{#if !videos}
			<button on:click={loadAllVideos}>Show All</button>
		{/if}
	{/if}

	{#if videos}
		{#if videos.length === 0}
			<h1>There is no video yet</h1>
		{:else}
			{#each videos as item}
				<li style="display: flex; align-items:start; border:solid; border-width: 2px; border-radius: 10px; padding: 5px;justify-content: space-between;margin-bottom:4px">
					<a target="_blank" href="http://youtube.com/watch?v={item.id}">{item.title}</a>
					<button
						on:click={() => {
							removeSavedVideo(item);
						}}>&#10005;</button
					>
				</li>
			{/each}
		{/if}
	{/if}
</main>
