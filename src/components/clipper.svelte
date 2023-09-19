<script lang="ts">
	import { onMount } from 'svelte';
	import { parseVideo } from '../utils/parse-video';
	import type { IVideo } from '../interfaces/video';
	import { secondToTimeString } from '../utils/second-to-time-string';
	import { timeStringToSecond } from '../utils/time-string-to-second';

	export let tab: chrome.tabs.Tab;
	export let id: string;

	let start: string = '';
	let end: string = '';
	let loop: boolean = false;
	let message = '';

	onMount(async () => {
		const res = await chrome.storage.local.get(id);
		const video = parseVideo(res[id]);
		if (!video) {
			return;
		}
		start = secondToTimeString(video.start);
		end = secondToTimeString(video.end);
		loop = video.loop;
	});

	async function saveVideo() {
		if (!start && !end) {
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

		const video: IVideo = { loop, title: tab.title, start: startSeconds, end: endSeconds };
		const videos = await chrome.storage.local.get();
		videos[id] = video;
		await chrome.storage.local.set(videos);
	}

	async function clearVideo() {
		await chrome.storage.local.remove(id).then();
		message = 'Success';
		start = '';
		end = '';
		loop = false;
	}
</script>

<div>
	<h3 id="title">{tab.title}</h3>
	<div style="margin-bottom: 10px">
		<div style="display: flex; gap: 10px">
			<div>
				<div>Start</div>
				<input type="text" placeholder="HH:MM:SS" bind:value={start} />
			</div>
			<div>
				<div>End</div>
				<input type="text" placeholder="HH:MM:SS" bind:value={end} />
			</div>
		</div>
		<div style="display: flex">
			<div>Loop:</div>
			<input type="checkbox" bind:checked={loop} />
		</div>
	</div>
	<button on:click={saveVideo}>Save</button>
	<button on:click={clearVideo}>Clear</button>
	<p>{message}</p>
</div>
