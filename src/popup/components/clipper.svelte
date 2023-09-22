<script lang="ts">
	import { onMount } from 'svelte';
	import type { IVideo } from '../../interfaces/video';
	import { secondToTimeString } from '../../utils/second-to-time-string';
	import { timeStringToSecond } from '../../utils/time-string-to-second';
	import { storage } from '../../storage';

	export let tab: chrome.tabs.Tab;
	export let id: string;

	let start: string = '';
	let end: string = '';
	let loop: boolean = false;
	let message = '';

	onMount(async () => {
		const test = await storage.get();
		const video = test.videos.get(id);
		if (!video) {
			return;
		}
		start = secondToTimeString(video.start);
		end = secondToTimeString(video.end);
		loop = video.loop;
	});

	async function saveVideo() {
		if (!start && !end && !loop) {
			console.log('Please input one');
			return;
		}

		const startSeconds = timeStringToSecond(start);
		if (start && startSeconds === -1) {
			message = 'Start time is not valid';
			return;
		}

		const endSeconds = timeStringToSecond(end);
		if (end && endSeconds === -1) {
			message = 'End time is not valid';
			return;
		}

		const video: IVideo = { loop, title: tab.title!, start: startSeconds, end: endSeconds, id };
		const videos = (await storage.get()).videos;
		videos.set(id, video);
		await storage.set({
			count: 0,
			videos: videos,
		});
		message = 'Saved';
	}

	async function clearVideo() {
		const value = await storage.get();
		value.videos.delete(id);
		await storage.set(value);
		message = 'Cleared';
		start = '';
		end = '';
		loop = false;
	}
</script>

<div class="w-full mb-4">
	<span class="text-sm">{tab.title}</span>
	<div class="flex flex-col mb-4 gap-2">
		<div class="flex gap-4 items-end">
			<div class="w-full">
				<div>Start</div>
				<input
					class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500"
					type="text"
					placeholder="HH:MM:SS"
					bind:value={start}
				/>
			</div>
			<div class="w-full">
				<div>End</div>
				<input
					class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500"
					type="text"
					placeholder="HH:MM:SS"
					bind:value={end}
				/>
			</div>
			<div class="flex flex-col justify-center items-start">
				<input
					bind:checked={loop}
					id="checked-checkbox"
					type="checkbox"
					value=""
					class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
				/>
				<label for="checked-checkbox" class="text-xs font-medium text-gray-900 dark:text-gray-300">LOOP</label>
			</div>
		</div>
	</div>
	<div class="flex gap-2 items-center">
		<button
			disabled={!start && !end && !loop}
			on:click={saveVideo}
			class="text-white bg-blue-700 hover:enabled:bg-blue-800 focus:ring-4 focus:outline-none disabled:opacity-70 focus:ring-blue-300 font-medium rounded-lg text-sm w-[70px] sm:w-auto px-4 py-1.5 text-center"
			>Save</button
		>
		<button
			on:click={clearVideo}
			disabled={!start && !end && !loop}
			class="text-white bg-red-600 hover:enabled:bg-red-700 focus:ring-4 disabled:opacity-70 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-[70px] sm:w-auto px-4 py-1.5 text-center"
			>Clear</button
		>
		{#if message != ''}
			<p class="ml-2 text-green-500 font-medium text-xs">{message}</p>
		{/if}
	</div>
</div>
