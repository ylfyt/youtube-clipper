<script lang="ts">
	import { onMount } from 'svelte';
	import CutIcon from '../assets/svg/cut-icon.svelte';
	import SettingIcon from '../assets/svg/setting-icon.svelte';
	import VolumeIcon from '../assets/svg/volume-icon.svelte';
	import { storageDriver } from '../storage-driver';
	import AudioController from './pages/audio-controller.svelte';
	import ClipperPage from './pages/clipper-page.svelte';
	import { storage } from './stores/storage';
	import MoonIcon from '../assets/svg/moon-icon.svelte';
	import SunIcon from '../assets/svg/sun-icon.svelte';

	let init = false;
	let isLight: boolean = false;
	let isClipper = false;

	const updateTheme = () => {
		if (!init) {
			return;
		}
		storage.update((prev) => {
			prev.isLight = isLight;
			return prev;
		});
		document.body.classList.toggle('dark');
	};

	$: isLight, updateTheme();
	$: $storage,
		(async () => {
			if (!init) {
				return;
			}
			await storageDriver.set($storage);
		})();

	onMount(async () => {
		const res = await storageDriver.get();
		storage.set(res);
		isLight = res.isLight;
		init = true;
	});
</script>

<main class="min-w-[500px] p-2 bg-light dark:bg-dark flex flex-col items-center text-dark dark:text-light">
	<div class="flex items-center gap-2 w-full">
		<button
			on:click={() => {
				isLight = !isLight;
			}}
			class="fill-yellow-400 mr-1"
		>
			{#if isLight}
				<MoonIcon width={18} />
			{:else}
				<SunIcon width={18} />
			{/if}
		</button>
		<a href="../options/index.html" target="_blank" class="fill-orange-600 mr-4"> <SettingIcon width={18} /> </a>
		<button
			on:click={() => {
				isClipper = true;
			}}
			class={`fill-red-500 rounded py-1 w-full flex items-center justify-center gap-2 text-sm font-semibold ${
				isClipper ? 'bg-color0  dark:fill-white dark:text-white fill-dark text-dark' : 'bg-slate-300 text-dark'
			}`}
		>
			<CutIcon width={20} />
			<span>Youtube Clipper</span>
		</button>
		<button
			on:click={() => {
				isClipper = false;
			}}
			class={`fill-red-500 rounded py-1 w-full flex items-center justify-center gap-2 text-sm font-semibold ${
				isClipper ? 'bg-slate-300 text-dark' : 'bg-color0  dark:fill-white dark:text-white fill-dark text-dark'
			}`}
		>
			<VolumeIcon width={20} />
			<span>Media Control</span>
		</button>
	</div>
	<div class="h-[2px] bg-color0 w-full mt-2 mb-2" />
	{#if isClipper}
		<ClipperPage />
	{:else}
		<AudioController />
	{/if}
</main>
