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
					isLoop: false,
				});
				continue;
			}

			const res = await chrome.scripting.executeScript({
				func: () => {
					const video = document.getElementById('movie_player') as any;
					const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]');
					const isShuffled = shuffleButton?.getAttribute('aria-pressed') === 'true';
					return {
						volume: video?.getVolume() ?? 0,
						isPaused: document.querySelector('video')?.paused ?? false,
						isLoop: video?.getLoopVideo() ?? false,
						isShuffled,
					};
				},
				target: { tabId: tab.id! },
				world: 'MAIN',
			});
			temp.push({
				isMuted: !!tab.mutedInfo?.muted,
				isYoutube: true,
				title: tab.title ?? '',
				volume: res[0].result.volume,
				isPlaylist: !!tab.url?.includes('list='),
				id: tab.id ?? 0,
				isPaused: res[0].result?.isPaused,
				iconUrl: tab.favIconUrl,
				isLoop: res[0].result.isLoop,
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
