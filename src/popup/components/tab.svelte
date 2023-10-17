<script lang="ts">
	import ForwardIcon from '../../assets/svg/forward-icon.svelte';
	import LoopIcon from '../../assets/svg/loop-icon.svelte';
	import MinusIcon from '../../assets/svg/minus-icon.svelte';
	import MutedIcon from '../../assets/svg/muted-icon.svelte';
	import NextIcon from '../../assets/svg/next-icon.svelte';
	import PauseIcon from '../../assets/svg/pause-icon.svelte';
	import PlayIcon from '../../assets/svg/play-icon.svelte';
	import PlusIcon from '../../assets/svg/plus-icon.svelte';
	import PrevIcon from '../../assets/svg/prev-icon.svelte';
	import RewindIcon from '../../assets/svg/rewind-icon.svelte';
	import ShuffleIcon from '../../assets/svg/shuffle-icon.svelte';
	import VolumeIcon from '../../assets/svg/volume-icon.svelte';
	import type { ITab } from '../../interfaces/tab';
	import Button from './button.svelte';

	export let tab: ITab;
	export let tabs: ITab[];

	const toggleMute = async (tabId: number, state: boolean) => {
		await chrome.tabs.update(tabId, { muted: !state });
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.isMuted = !state;
			}
			return tab;
		});
	};

	const upVolume = async (tabId: number) => {
		const res = await chrome.scripting.executeScript({
			func: () => {
				const video: any = document.getElementById('movie_player');
				video.setVolume(video.getVolume() + 2);
				return video.getVolume();
			},
			target: {
				tabId,
			},
			world: 'MAIN',
		});

		const newVolume = Math.round(res?.[0]?.result);
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.volume = newVolume;
			}
			return tab;
		});
	};

	const downVolume = async (tabId: number) => {
		const res = await chrome.scripting.executeScript({
			func: () => {
				const video: any = document.getElementById('movie_player');
				video.setVolume(video.getVolume() - 2);
				return video.getVolume();
			},
			target: {
				tabId,
			},
			world: 'MAIN',
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
			func: () => {
				document.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'N',
						keyCode: 78,
						which: 78,
						shiftKey: true,
						ctrlKey: false,
						metaKey: false,
					})
				);
			},
			target: {
				tabId,
			},
		});

		setTimeout(async () => {
			const newTab = await chrome.tabs.get(tabId);
			tabs = tabs.map((tab) => {
				if (tab.id === tabId) {
					tab.title = newTab.title ?? '';
				}
				return tab;
			});
		}, 2000);
	};

	const prev = async (tabId: number) => {
		await chrome.scripting.executeScript({
			func: () => {
				document.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'P',
						keyCode: 80,
						which: 80,
						shiftKey: true,
						ctrlKey: false,
						metaKey: false,
					})
				);
			},
			target: {
				tabId,
			},
		});

		setTimeout(async () => {
			const newTab = await chrome.tabs.get(tabId);
			tabs = tabs.map((tab) => {
				if (tab.id === tabId) {
					tab.title = newTab.title ?? '';
				}
				return tab;
			});
		}, 2000);
	};

	const togglePlay = async (tabId: number) => {
		await chrome.scripting.executeScript({
			func: () => {
				document.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'k',
						keyCode: 75,
						code: 'KeyK',
						which: 75,
						shiftKey: false,
						ctrlKey: false,
						metaKey: false,
					})
				);

				return document.querySelector('video')!.paused;
			},
			target: {
				tabId,
			},
		});
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.isPaused = !tab.isPaused;
			}
			return tab;
		});
	};

	const toggleLoop = async (tabId: number) => {
		await chrome.scripting.executeScript({
			func: () => {
				const video: any = document.getElementById('movie_player');
				video && video.setLoopVideo(!video.getLoopVideo());
			},
			target: {
				tabId,
			},
			world: 'MAIN',
		});
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.isLoop = !tab.isLoop;
			}
			return tab;
		});
	};

	const toggleShuffle = async (tabId: number) => {
		await chrome.scripting.executeScript({
			func: () => {
				const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]') as HTMLButtonElement;
				shuffleButton?.click();
			},
			target: {
				tabId,
			},
			world: 'MAIN',
		});
		tabs = tabs.map((tab) => {
			if (tab.id === tabId) {
				tab.isShuffled = !tab.isShuffled;
			}
			return tab;
		});
	};

	const seekVideo = async (tabId: number, second: number) => {
		await chrome.scripting.executeScript<
			{
				second: number;
			}[],
			void
		>({
			func: (...args: { second: number }[]) => {
				const video: any = document.getElementById('movie_player');
				video && video.seekBy(args[0].second);
			},
			target: {
				tabId,
			},
			world: 'MAIN',
			args: [{ second }],
		});
	};
</script>

<div class="flex w-full justify-between border-[1px] border-color0 p-1.5 gap-2 rounded flex-col shadow">
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
				<Button
					title="Decrease volume"
					onClick={() => {
						downVolume(tab.id);
					}}
				>
					<MinusIcon width={12} />
				</Button>
				<span class="bg-[#abdeee] text-black w-[30px] py-0.5 rounded flex items-center justify-center h-full">{Math.floor(tab.volume)}</span>
				<Button
					title="Increase volume"
					onClick={() => {
						upVolume(tab.id);
					}}
				>
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
					title={`Loop ${tab.isLoop ? 'ON' : 'OFF'}`}
					bgColor={tab.isLoop ? 'bg-green-500' : 'bg-red-500'}
				>
					<LoopIcon width={12} />
				</Button>
				{#if tab.isPlaylist}
					<Button
						onClick={() => {
							toggleShuffle(tab.id);
						}}
						title={`Shuffle ${tab.isShuffled ? 'ON' : 'OFF'}`}
						bgColor={tab.isShuffled ? 'bg-green-500' : 'bg-red-500'}
					>
						<ShuffleIcon width={12} />
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
