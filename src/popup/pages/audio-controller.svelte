<script lang="ts">
	import { onMount } from 'svelte';
	import type { ITab } from '../../interfaces/tab';
	import { storage } from '../stores/storage';
	import { storageDriver } from '../../storage-driver';
	import Tab from '../components/tab.svelte';

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
					id: tab.id ?? 0,
					isPaused: true,
					iconUrl: tab.favIconUrl,
					loopState: 0,
				});
				continue;
			}

			const isPlaylist = !!tab.url?.includes('list=');

			const res = await chrome.scripting.executeScript<
				{ isPlaylist: boolean }[],
				{
					volume: number;
					isPaused: boolean;
					loopState: number;
					isShuffled: boolean;
				}
			>({
				func: (
					...args: {
						isPlaylist: boolean;
					}[]
				) => {
					const video = document.getElementById('movie_player') as any;
					let loopState = 0; // loop is turned off
					if (args[0].isPlaylist) {
						if (document.querySelector('[aria-label="Loop video"]')) {
							loopState = 1; // loop playlist
						} else if (document.querySelector('[aria-label="Turn off loop"]')) {
							loopState = 2; // loop video
						}
					} else {
						loopState = !!video?.getLoopVideo() ? 2 : 0;
					}

					const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]');
					const isShuffled = shuffleButton?.getAttribute('aria-pressed') === 'true';
					return {
						volume: video?.getVolume() ?? 0,
						isPaused: document.querySelector('video')?.paused ?? false,
						loopState,
						isShuffled,
					};
				},
				target: { tabId: tab.id! },
				world: 'MAIN',
				args: [{ isPlaylist }],
			});
			temp.push({
				isMuted: !!tab.mutedInfo?.muted,
				isYoutube: true,
				title: tab.title ?? '',
				volume: res[0].result.volume,
				isPlaylist,
				id: tab.id ?? 0,
				isPaused: res[0].result?.isPaused,
				iconUrl: tab.favIconUrl,
				loopState: res[0].result.loopState,
				isShuffled: res[0].result.isShuffled,
			});
		}
		tabs = temp;
	});
</script>

<div class="flex flex-col gap-2 w-full">
	{#each tabs as tab}
		<Tab {tab} bind:tabs />
	{/each}
</div>
