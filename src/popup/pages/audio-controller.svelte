<script lang="ts">
	import { onMount } from 'svelte';
	import type { ITab } from '../../interfaces/tab';
	import MutedIcon from '../../assets/svg/muted-icon.svelte';
	import VolumeIcon from '../../assets/svg/volume-icon.svelte';
	import PrevIcon from '../../assets/svg/prev-icon.svelte';
	import NextIcon from '../../assets/svg/next-icon.svelte';
	import PauseIcon from '../../assets/svg/pause-icon.svelte';
	import MinusIcon from '../../assets/svg/minus-icon.svelte';
	import PlusIcon from '../../assets/svg/plus-icon.svelte';
	import Button from '../components/button.svelte';
	import PlayIcon from '../../assets/svg/play-icon.svelte';
	import { storage } from '../stores/storage';
	import { storageDriver } from '../../storage-driver';

	let tabs: ITab[] = [];
	let init = false;

	$: $storage,
		(async () => {
			if (!init) {
				return;
			}
			await storageDriver.set($storage);
		})();

	const isIncluded = (url: string) => {
		for (let pattern of $storage.includedUrls) {
			if (url.includes(pattern)) return true;
		}

		return false;
	};

	onMount(async () => {
		const res = await storageDriver.get();
		init = true;
		storage.set(res);

		const chromeTabs = await chrome.tabs.query({});
		const temp: ITab[] = [];
		for (let tab of chromeTabs) {
			if ($storage.includedUrls.length !== 0 && !isIncluded(tab.url!)) {
				continue;
			}
			const isYoutube = tab.url?.includes('youtube.com/watch') || tab.url?.includes('youtube.com/shorts');
			if (!isYoutube) {
				temp.push({
					isMuted: !!tab.mutedInfo?.muted,
					isYoutube: false,
					title: tab.title ?? '',
					volume: 0,
					isPlaylist: false,
					id: tab.id,
					isPaused: true,
				});
				continue;
			}

			const res = await chrome.scripting.executeScript({
				func: () => {
					const video = document.getElementById('movie_player') as any;
					return {
						volume: video?.getVolume() ?? 0,
						isPaused: document.querySelector('video')?.paused ?? false,
					};
				},
				target: { tabId: tab.id! },
				world: 'MAIN',
			});
			temp.push({
				isMuted: !!tab.mutedInfo?.muted,
				isYoutube: true,
				title: tab.title ?? '',
				volume: res?.[0]?.result.volume,
				isPlaylist: !!tab.url?.includes('list='),
				id: tab.id,
				isPaused: res?.[0]?.result?.isPaused,
			});
		}
		tabs = temp;
	});

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
		}, 1000);
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
		}, 1000);
	};

	const togglePlay = async (tabId: number) => {
		const res = await chrome.scripting.executeScript({
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
</script>

<div class="flex flex-col gap-2 w-full">
	{#each tabs as tab}
		<div class="flex w-full justify-between p-2 bg-primary gap-2 rounded text-white flex-col">
			<div class="text-sm font-medium">{tab.title}</div>
			<div class="flex gap-6">
				<Button
					onClick={() => {
						toggleMute(tab.id ?? 0, tab.isMuted);
					}}
				>
					{#if tab.isMuted}
						<MutedIcon width={14} />
					{:else}
						<VolumeIcon width={14} />
					{/if}
				</Button>
				{#if tab.isYoutube}
					<div class="flex gap-2 items-center">
						<Button
							onClick={() => {
								downVolume(tab.id ?? 0);
							}}
						>
							<MinusIcon width={14} />
						</Button>
						<span class="bg-[#abdeee] text-black w-[30px] py-0.5 rounded flex items-center justify-center h-full">{Math.floor(tab.volume)}</span>
						<Button
							onClick={() => {
								upVolume(tab.id ?? 0);
							}}
						>
							<PlusIcon width={14} />
						</Button>
					</div>
					<div class="flex items-center justify-center gap-2">
						<Button
							hide={!tab.isPlaylist}
							onClick={() => {
								prev(tab.id ?? 0);
							}}
						>
							<PrevIcon width={14} />
						</Button>
						<Button
							onClick={() => {
								togglePlay(tab.id ?? 0);
							}}
						>
							{#if tab.isPaused}
								<PlayIcon width={14} />
							{:else}
								<PauseIcon width={14} />
							{/if}
						</Button>
						<Button
							onClick={() => {
								next(tab.id ?? 0);
							}}
						>
							<NextIcon width={14} />
						</Button>
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
