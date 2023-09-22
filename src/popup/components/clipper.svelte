<script lang="ts">
	import { onMount } from 'svelte';
	import { secondToTimeString } from '../../utils/second-to-time-string';
	import { timeStringToSecond } from '../../utils/time-string-to-second';
	import { storage } from '../stores/storage';
	import ClipTime from './clip-time.svelte';
	import type { IClipTime } from '../interfaces/clip-time';
	import type { IVideoClip } from '../../interfaces/clip-time';
	import CloseButton from './close-button.svelte';
	import AddButton from './add-button.svelte';

	export let tab: chrome.tabs.Tab;
	export let id: string;

	let clips: IClipTime[] = [
		{
			start: '',
			end: '',
			loop: false,
		},
	];

	let message = '';

	$: isCanSave = !!clips.find((clip) => clip.start || clip.end || clip.loop);

	onMount(async () => {
		const video = $storage.videos.get(id);
		if (!video) {
			return;
		}
		for (let i = 0; i < video.clips.length; i++) {
			const clip = video.clips[i];
			if (i === 0) {
				clips[0].start = secondToTimeString(clip.start);
				clips[0].end = secondToTimeString(clip.end);
				clips[0].loop = clip.loop;
				continue;
			}

			clips.push({
				start: secondToTimeString(clip.start),
				end: secondToTimeString(clip.end),
				loop: clip.loop,
			});
		}
	});

	async function saveVideo() {
		const videoClips: IVideoClip[] = [];
		for (let clip of clips) {
			const canSave = clip.start || clip.end || clip.loop;
			if (!canSave) {
				continue;
			}
			const startSeconds = timeStringToSecond(clip.start);
			if (clip.start && startSeconds === -1) {
				message = 'Start time is not valid';
				return;
			}

			const endSeconds = timeStringToSecond(clip.end);
			if (clip.end && endSeconds === -1) {
				message = 'End time is not valid';
				return;
			}

			if (clip.start && clip.end && endSeconds <= startSeconds) {
				message = 'End time should be greater than start time';
				return;
			}

			videoClips.push({
				start: startSeconds,
				end: endSeconds,
				loop: clip.loop,
			});
		}

		storage.update((prev) => {
			prev.videos.set(id, {
				id,
				title: tab.title!,
				clips: videoClips,
			});
			return prev;
		});
		message = 'Saved';
	}

	async function clearVideo() {
		storage.update((prev) => {
			prev.videos.delete(id);
			return prev;
		});

		for (let i = 0; i < clips.length; i++) {
			clips[i].start = '';
			clips[i].end = '';
			clips[i].loop = false;
		}
		message = 'Cleared';
	}

	function updateClips(isInc: boolean) {
		if (isInc) {
			clips.push({
				end: '',
				start: '',
				loop: false,
			});
			clips = [...clips];
			return;
		}
		clips.pop();
		clips = [...clips];
	}
</script>

<div class="w-full mb-4">
	<span class="text-sm">{tab.title}</span>
	<div class="flex gap-2 mt-4 items-center">
		<button
			disabled={!isCanSave}
			on:click={saveVideo}
			class="text-white bg-blue-700 hover:enabled:bg-blue-800 focus:ring-4 focus:outline-none disabled:opacity-70 focus:ring-blue-300 font-normal rounded-lg text-xs py-1 w-[70px] sm:w-auto text-center"
			>Save</button
		>
		<button
			on:click={clearVideo}
			disabled={!isCanSave}
			class="text-white bg-red-600 hover:enabled:bg-red-700 focus:ring-4 disabled:opacity-70 focus:outline-none focus:ring-red-300 font-normal rounded-lg text-xs py-1 w-[70px] sm:w-auto text-center"
			>Clear</button
		>
		{#if message != ''}
			<p class="ml-2 text-green-500 font-medium text-xs">{message}</p>
		{/if}
	</div>
	<div class="flex flex-col mb-1 mt-2 gap-2 items-start">
		{#each clips as clip}
			<div class="flex items-center gap-5 w-full">
				<ClipTime bind:clip />
				<CloseButton hide={clips.length < 2} onClick={() => updateClips(false)} />
			</div>
		{/each}
		<div class="w-[70px] rounded-md">
			<AddButton onClick={() => updateClips(true)} />
		</div>
	</div>
</div>
