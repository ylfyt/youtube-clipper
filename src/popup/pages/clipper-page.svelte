<script lang="ts">
	import { onMount } from 'svelte';
	import Clipper from '../components/clipper.svelte';
	import type { IVideo } from '../../interfaces/video';
	import { storageDriver } from '../../storage-driver';
	import { storage } from '../stores/storage';

	let youtubeTab: chrome.tabs.Tab | undefined;
	let videoId: string | undefined | null;

	let videos: IVideo[] | null = null;
	let init = false;

	$: $storage,
		(async () => {
			if (!init) {
				return;
			}
			await storageDriver.set($storage);
		})();

	onMount(async () => {
		const res = await storageDriver.get();
		init = true;
		storage.set(res);

		const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
		if (activeTab.url?.indexOf('youtube.com/watch') === -1) {
			// loadAllVideos();
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

	function loadAllVideos() {
		const storedVideos = $storage.videos;
		const temp: IVideo[] = [];
		for (let key of Object.keys(storedVideos)) {
			const video = storedVideos[key];
			temp.push(video);
		}
		videos = temp;
	}

	async function removeSavedVideo(video: IVideo) {
		storage.update((prev) => {
			delete prev.videos[video.id];
			return prev;
		});
		const temp: IVideo[] = [];
		for (let key of Object.keys($storage.videos)) {
			const video = $storage.videos[key];
			temp.push(video);
		}
		videos = temp;
	}
</script>

<div class="w-full flex flex-col items-center">
	{#if youtubeTab && videoId}
		<Clipper tab={youtubeTab} id={videoId} />
	{/if}

	{#if !videos}
		<button class="bg-color0 px-2 py-1 rounded-md font-semibold text-dark dark:text-white mt-4" on:click={loadAllVideos}>Show Saved Videos</button>
	{:else if videos.length === 0}
		<h1 class="w-full text-center text-base mt-4 font-medium">There is no video yet</h1>
	{:else}
		<ul class={`w-full ${videoId ? 'mt-4' : ''}`}>
			{#each videos as item}
				<li class="flex items-center justify-between border-[1px] border-color0 px-2 py-1 rounded">
					<a target="_blank" class="font-medium" href="http://youtube.com/watch?v={item.id}">{item.title}</a>
					<button
						on:click={() => {
							removeSavedVideo(item);
						}}>&#10005;</button
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>
