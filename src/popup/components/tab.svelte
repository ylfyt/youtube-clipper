<script lang="ts">
	import ForwardIcon from "@/assets/svg/forward-icon.svelte";
	import LoopIcon from "@/assets/svg/loop-icon.svelte";
	import MinusIcon from "@/assets/svg/minus-icon.svelte";
	import MutedIcon from "@/assets/svg/muted-icon.svelte";
	import NextIcon from "@/assets/svg/next-icon.svelte";
	import PauseIcon from "@/assets/svg/pause-icon.svelte";
	import PlayIcon from "@/assets/svg/play-icon.svelte";
	import PlusIcon from "@/assets/svg/plus-icon.svelte";
	import PrevIcon from "@/assets/svg/prev-icon.svelte";
	import RewindIcon from "@/assets/svg/rewind-icon.svelte";
	import ShuffleIcon from "@/assets/svg/shuffle-icon.svelte";
	import VolumeIcon from "@/assets/svg/volume-icon.svelte";
	import type { ITab } from "@/interfaces/tab";
	import { YtEvents, dispatchYtEvent, seekVideoYt, setYtVolume, shuffleYt, toggleLoopYt, type SeekVideoYtArgs, type SetYtVolumeArgs, type ToggleLoopYtArgs } from "@/utils/yt-utils";
	import Button from "./button.svelte";
	import ArrowRight from "./icons/arrow-right.svelte";
	import VideoPlaylist from "./video-playlist.svelte";
	import { secondToTimeString } from "@/utils/second-to-time-string";

	export let tab: ITab;
	export let tabs: ITab[];
	export let idx: number;

	let showPlaylist = idx === 0 && tab.isYoutube && tab.isPlaylist;
	let youtubeVolume = tab.volume;
	let seekPosition = tab.duration === 0 ? 0 : (tab.currentTime / tab.duration) * 100;

	const toggleMute = async (tabId: number, state: boolean) => {
		await chrome.tabs.update(tabId, { muted: !state });
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.isMuted = !state;
			}
			return tab;
		});
	};

	const refreshTabs = () => {
		setTimeout(async () => {
			const newTab = await chrome.tabs.get(tab.id);
			tabs = tabs.map((el) => {
				if (el.id === tab.id) el.title = newTab.title ?? "";
				return el;
			});
		}, 2000);
	};

	const setVolume = async () => {
		await chrome.scripting.executeScript<SetYtVolumeArgs, number>({
			func: setYtVolume,
			target: { tabId: tab.id },
			world: "MAIN",
			args: [youtubeVolume],
		});
	};

	const next = async (tabId: number) => {
		await chrome.scripting.executeScript({
			func: dispatchYtEvent,
			target: { tabId },
			args: [YtEvents.next()],
		});

		refreshTabs();
	};

	const prev = async (tabId: number) => {
		await chrome.scripting.executeScript({
			func: dispatchYtEvent,
			target: { tabId },
			args: [YtEvents.prev()],
		});

		refreshTabs();
	};

	const togglePlay = async (tabId: number) => {
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.isPaused = !tab.isPaused;
			}
			return tab;
		});
		await chrome.scripting.executeScript({
			func: dispatchYtEvent,
			target: { tabId },
			args: [tab.isYoutubeMusic ? YtEvents.playToggleMusic() : YtEvents.playToggle()],
		});
	};

	const toggleLoop = async (tabId: number) => {
		const res = await chrome.scripting.executeScript<ToggleLoopYtArgs, { loopState: number }>({
			func: toggleLoopYt,
			target: { tabId },
			world: "MAIN",
			args: [{ isPlaylist: tab.isPlaylist, isYoutubeMusic: !!tab.isYoutubeMusic }],
		});
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.loopState = res[0].result.loopState;
			}
			return tab;
		});
	};

	const toggleShuffle = async (tabId: number) => {
		if (tab.isYoutubeMusic) {
			await chrome.scripting.executeScript({
				func: dispatchYtEvent,
				target: { tabId },
				args: [YtEvents.shuffleMusic()],
			});
			return;
		}

		await chrome.scripting.executeScript({
			func: shuffleYt,
			target: { tabId },
			world: "MAIN",
		});
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.isShuffled = !tab.isShuffled;
			}
			return tab;
		});
	};

	const seekVideo = async (tabId: number, second: number, to?: number) => {
		await chrome.scripting.executeScript<SeekVideoYtArgs, void>({
			func: seekVideoYt,
			target: { tabId },
			world: "MAIN",
			args: [{ second, to }],
		});
	};

	const openTab = async () => {
		await chrome.tabs.update(tab.id, {
			active: true,
		});
	};
</script>

<div class="flex w-full justify-between border-[1px] border-color0 p-1.5 gap-2 rounded flex-col shadow relative">
	<button on:click={openTab} title="Open Tab" class="absolute top-0 right-1 fill-secondary dark:fill-orange-500">
		<ArrowRight width={18} />
	</button>
	<div class="flex items-start gap-2">
		{#if tab.iconUrl}
			<img width="18px" src={tab.iconUrl} alt="icon" />
		{/if}
		<span class="text-sm font-medium">{tab.title}</span>
	</div>
	{#if tab.duration}
		<div class="flex items-center gap-2">
			<Button
				title="Rewind 10s"
				onClick={() => {
					seekVideo(tab.id, -10);
				}}
				bgColor="bg-orange-500"
			>
				<RewindIcon width={12} />
			</Button>
			<span class="text-sm">{secondToTimeString(Math.floor((seekPosition / 100) * tab.duration))}</span>
			<input bind:value={seekPosition} type="range" min="0" max={100} class="flex-1" on:change={() => seekVideo(tab.id, 0, (seekPosition / 100) * tab.duration)} />
			<span class="text-sm">{secondToTimeString(Math.floor(tab.duration))}</span>
			<Button
				title="Forward 10s"
				onClick={() => {
					seekVideo(tab.id, 10);
				}}
				bgColor="bg-orange-500"
			>
				<ForwardIcon width={12} />
			</Button>
		</div>
	{/if}
	<div class="flex gap-4">
		<Button
			title="Mute/Unmute"
			onClick={() => {
				toggleMute(tab.id, tab.isMuted);
			}}
		>
			{#if tab.isMuted}
				<MutedIcon width={12} />
			{:else}
				<VolumeIcon width={12} />
			{/if}
		</Button>
		{#if tab.isYoutube}
			<div class="flex gap-2 items-center">
				<input bind:value={youtubeVolume} type="range" min="0" max="100" class="w-20" on:change={setVolume} />
				<span class="bg-[#abdeee] text-black w-[30px] rounded flex items-center justify-center h-full">{Math.floor(youtubeVolume)}</span>
			</div>
			<div class="flex items-center justify-center gap-2">
				<Button
					title="Prev"
					bgColor="bg-orange-500"
					hide={!tab.isPlaylist}
					onClick={() => {
						prev(tab.id);
					}}
				>
					<PrevIcon width={12} />
				</Button>
				<Button
					title="Play/Pause"
					bgColor="bg-orange-500"
					onClick={() => {
						togglePlay(tab.id);
					}}
				>
					{#if tab.isPaused}
						<PlayIcon width={12} />
					{:else}
						<PauseIcon width={12} />
					{/if}
				</Button>
				<Button
					title="Next"
					bgColor="bg-orange-500"
					onClick={() => {
						next(tab.id);
					}}
				>
					<NextIcon width={12} />
				</Button>
			</div>
			<div class="flex gap-2">
				<Button
					onClick={() => {
						toggleLoop(tab.id);
					}}
					title={`Loop ${tab.loopState ? "ON" : "OFF"}`}
					bgColor={!tab.isPlaylist || tab.isPlaylistMix ? (!tab.loopState ? "bg-red-500" : "bg-green-500") : !tab.loopState ? "bg-red-500" : tab.loopState === 1 ? "bg-green-500" : "bg-orange-500"}
				>
					<LoopIcon width={12} />
				</Button>
				{#if tab.isPlaylist && !tab.isPlaylistMix}
					<Button
						onClick={() => {
							toggleShuffle(tab.id);
						}}
						title={`Shuffle ${tab.isShuffled ? "ON" : "OFF"}`}
						bgColor={tab.isShuffled ? "bg-green-500" : "bg-red-500"}
					>
						<ShuffleIcon width={12} />
					</Button>
				{/if}
			</div>
			{#if tab.isPlaylist}
				<div class="ml-auto">
					<Button onClick={() => (showPlaylist = !showPlaylist)} class={`text-base transition-all ${showPlaylist ? "" : "-rotate-90"}`} bgColor="bg-transparent">🔽</Button>
				</div>
			{/if}
		{/if}
	</div>
	{#if showPlaylist}
		<VideoPlaylist {refreshTabs} tabId={tab.id} />
	{/if}
</div>
