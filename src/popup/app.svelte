<script lang="ts">
	import VolumeIcon from '../assets/svg/volume-icon.svelte';
	import YoutubeIcon from '../assets/svg/youtube-icon.svelte';
	import AudioController from './pages/audio-controller.svelte';
	import ClipperPage from './pages/clipper-page.svelte';

	let isClipper = false;
</script>

<main class="min-w-[500px] p-2 bg-yellow-50 flex flex-col items-center">
	<div class="flex items-center gap-2 w-full mb-4">
		<button
			on:click={() => {
				isClipper = true;
			}}
			class={`fill-red-500 py-1 w-full flex items-center justify-center ${isClipper ? 'bg-primary fill-white' : 'bg-slate-300'}`}
		>
			<YoutubeIcon width={20} />
		</button>
		<button
			on:click={() => {
				isClipper = false;
			}}
			class={`fill-red-500 py-1 w-full flex items-center justify-center ${isClipper ? 'bg-slate-300' : 'bg-primary fill-white'}`}
		>
			<VolumeIcon width={20} />
		</button>
	</div>
	{#if isClipper}
		<ClipperPage />
	{:else}
		<AudioController />
	{/if}
</main>
