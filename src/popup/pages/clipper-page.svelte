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
		for (let video of storedVideos) {
			temp.push(video[1]);
		}
		videos = temp;
	}

	async function removeSavedVideo(video: IVideo) {
		storage.update((prev) => {
			prev.videos.delete(video.id);
			return prev;
		});
		const temp: IVideo[] = [];
		for (let video of $storage.videos) {
			temp.push(video[1]);
		}
		videos = temp;
	}
</script>

<div>
	{#if youtubeTab && videoId}
		<Clipper tab={youtubeTab} id={videoId} />
	{/if}

	{#if !videos}
		<button class="bg-yellow-300 px-2 py-1 rounded-md" on:click={loadAllVideos}>Show All</button>
	{:else if videos.length === 0}
		<h1 class="w-full text-center text-base">There is no video yet</h1>
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
</div>
