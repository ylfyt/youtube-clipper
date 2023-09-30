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
	let loop: boolean = false;

	let clips: IClipTime[] = [
		{
			start: '',
			end: '',
		},
	];

	let message = '';

	$: isCanSave = !!clips.find((clip) => clip.start || clip.end || loop);

	onMount(async () => {
		const video = $storage.videos.get(id);
		if (!video) {
			return;
		}
		loop = video.loop;
		for (let i = 0; i < video.clips.length; i++) {
			const clip = video.clips[i];
			if (i === 0) {
				clips[0].start = secondToTimeString(clip.start);
				clips[0].end = secondToTimeString(clip.end);
				continue;
			}

			clips.push({
				start: secondToTimeString(clip.start),
				end: secondToTimeString(clip.end),
			});
		}
	});

	async function saveVideo() {
		const videoClips: IVideoClip[] = [];
		for (let idx = 0; idx < clips.length; idx++) {
			const clip = clips[idx];
			const canSave = clip.start || clip.end || loop;
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

			if (idx > 0) {
				if (startSeconds <= videoClips[idx - 1].end || videoClips[idx - 1].end === -1) {
					message = `Start must be greater than the end of prev clip`;
					return;
				}
			}

			videoClips.push({
				start: startSeconds,
				end: endSeconds,
			});
		}

		storage.update((prev) => {
			prev.videos.set(id, {
				id,
				title: tab.title!,
				clips: videoClips,
				loop: loop,
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
		}
		message = 'Cleared';
	}

	function updateClips(isInc: boolean) {
		if (isInc) {
			clips.push({
				end: '',
				start: '',
			});
			clips = [...clips];
			return;
		}
		clips.pop();
		clips = [...clips];
	}
</script>

<div class="w-full mb-4">
  <div class="flex gap-2">
    <img width="20px" src={tab.favIconUrl} alt="icon">
    <span class="text-sm font-medium">{tab.title}</span>
  </div>
	<div class="flex justify-between items-center mt-4">
		<div class="flex gap-2 items-center">
			<button
				disabled={!isCanSave}
				on:click={saveVideo}
				class="font-semibold bg-color0 py-1 w-[70px] rounded-md disabled:opacity-80 disabled:cursor-not-allowed"
				>Save</button
			>
			<button
				on:click={clearVideo}
				disabled={!isCanSave}
				class="text-dark font-semibold bg-red-400 py-1 w-[70px] rounded-md disabled:opacity-80 disabled:cursor-not-allowed"
				>Clear</button
			>
			{#if message != ''}
				<p class="ml-2 text-green-500 font-medium text-xs">{message}</p>
			{/if}
		</div>
		<div class="flex justify-center items-start gap-2">
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
