<script lang="ts">
	import { onMount } from 'svelte';
	import Clipper from './components/clipper.svelte';
	import type { IVideo } from '../interfaces/video';
	import { storage } from '../storage';

	let youtubeTab: chrome.tabs.Tab | undefined;
	let videoId: string | undefined | null;

	let videos: IVideo[] | null = null;

	async function loadAllVideos() {
		const storedVideos = (await storage.get()).videos;
		const temp: IVideo[] = [];
		for (let video of storedVideos) {
			temp.push(video[1]);
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
		const value = await storage.get();
		value.videos.delete(video.id);
		await storage.set(value);

		const temp: IVideo[] = [];
		for (let video of value.videos) {
			temp.push(video[1]);
		}
		videos = temp;
	}
</script>

<main class="min-w-[500px] p-2 bg-yellow-50 flex flex-col items-center">
	{#if youtubeTab && videoId}
		<Clipper tab={youtubeTab} id={videoId} />
		{#if !videos}
			<button class="bg-yellow-300 px-2 py-1 rounded-md" on:click={loadAllVideos}>Show All</button>
		{/if}
	{/if}

	{#if videos}
		{#if videos.length === 0}
			<h1 class="w-full">There is no video yet</h1>
		{:else}
			<ul class="w-full">
				{#each videos as item}
					<li style="display: flex; align-items:start; border:solid; border-width: 2px; border-radius: 10px; padding: 5px;justify-content: space-between;margin-bottom:4px">
						<a target="_blank" class="text-red-400" href="http://youtube.com/watch?v={item.id}">{item.title}</a>
						<button
							on:click={() => {
								removeSavedVideo(item);
							}}>&#10005;</button
						>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</main>
