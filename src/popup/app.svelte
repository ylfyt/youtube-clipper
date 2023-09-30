<script lang="ts">
	import CutIcon from '../assets/svg/cut-icon.svelte';
	import SettingIcon from '../assets/svg/setting-icon.svelte';
	import VolumeIcon from '../assets/svg/volume-icon.svelte';
	import AudioController from './pages/audio-controller.svelte';
	import ClipperPage from './pages/clipper-page.svelte';

	let isClipper = false;
</script>

<main class="min-w-[500px] p-2 bg-yellow-50 flex flex-col items-center">
	<div class="flex items-center gap-2 w-full mb-4">
		<a href="../options/index.html" target="_blank" class="fill-orange-600"> <SettingIcon width={20} /> </a>
		<button
			on:click={() => {
				isClipper = true;
			}}
			class={`fill-red-500 rounded py-1 w-full flex items-center justify-center gap-2 text-sm font-semibold ${isClipper ? 'bg-primary fill-white text-white' : 'bg-slate-300'}`}
		>
			<CutIcon width={20} />
			<span>Youtube Clipper</span>
		</button>
		<button
			on:click={() => {
				isClipper = false;
			}}
			class={`fill-red-500 rounded py-1 w-full flex items-center justify-center gap-2 text-sm font-semibold ${isClipper ? 'bg-slate-300' : 'bg-primary fill-white text-white'}`}
		>
			<VolumeIcon width={20} />
			<span>Media Control</span>
		</button>
	</div>
	{#if isClipper}
		<ClipperPage />
	{:else}
		<AudioController />
	{/if}
</main>
