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

	export let tab: ITab;
	export let tabs: ITab[];
	export let idx: number;

	let showPlaylist = idx === 0 && tab.isYoutube && tab.isPlaylist;

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
				if (el.id === tab.id) {
					tab.title = newTab.title ?? "";
				}
				return tab;
			});
		}, 2000);
	};

	const setVolume = async (tabId: number, delta: number) => {
		const res = await chrome.scripting.executeScript<SetYtVolumeArgs, number>({
			func: setYtVolume,
			target: { tabId },
			world: "MAIN",
			args: [delta],
		});

		const newVolume = Math.round(res?.[0]?.result);
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.volume = newVolume;
			}
			return tab;
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

	const seekVideo = async (tabId: number, second: number) => {
		await chrome.scripting.executeScript<SeekVideoYtArgs, void>({
			func: seekVideoYt,
			target: { tabId },
			world: "MAIN",
			args: [{ second }],
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
	<div class="flex gap-6">
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
				<Button title="Decrease volume" onClick={() => setVolume(tab.id, -2)}>
					<MinusIcon width={12} />
				</Button>
				<span class="bg-[#abdeee] text-black w-[30px] py-0.5 rounded flex items-center justify-center h-full">{Math.floor(tab.volume)}</span>
				<Button title="Increase volume" onClick={() => setVolume(tab.id, 2)}>
					<PlusIcon width={12} />
				</Button>
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
					title="Rewind 10s"
					onClick={() => {
						seekVideo(tab.id, -10);
					}}
					bgColor="bg-orange-500"
				>
					<RewindIcon width={12} />
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
					title="Forward 10s"
					onClick={() => {
						seekVideo(tab.id, 10);
					}}
					bgColor="bg-orange-500"
				>
					<ForwardIcon width={12} />
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
					bgColor={!tab.isPlaylist ? (!tab.loopState ? "bg-red-500" : "bg-green-500") : !tab.loopState ? "bg-red-500" : tab.loopState === 1 ? "bg-green-500" : "bg-orange-500"}
				>
					<LoopIcon width={12} />
				</Button>
				{#if tab.isPlaylist}
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
