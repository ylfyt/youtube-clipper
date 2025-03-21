<script lang="ts">
	import { onMount } from "svelte";
	import type { ITab } from "../../interfaces/tab";
	import { storage } from "../stores/storage";
	import { storageDriver } from "../../storage-driver";
	import Tab from "../components/tab.svelte";

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
			const isYoutubeMusic = !!tab.url?.includes("music.youtube.co");
			const isYoutube = isYoutubeMusic || tab.url?.includes("youtube.com/watch") || tab.url?.includes("youtube.com/shorts");
			if (!isYoutube) {
				temp.push({
					isMuted: !!tab.mutedInfo?.muted,
					isYoutube: false,
					title: tab.title ?? "",
					volume: 0,
					isPlaylist: false,
					isPlaylistMix: false,
					id: tab.id ?? 0,
					isPaused: true,
					iconUrl: tab.favIconUrl,
					loopState: 0,
					currentTime: 0,
					duration: 0,
				});
				continue;
			}

			const isPlaylist = isYoutubeMusic || !!tab.url?.includes("list=");

			const res = await chrome.scripting.executeScript<
				{ isPlaylist: boolean; isYoutubeMusic: boolean }[],
				{
					volume: number;
					isPaused: boolean;
					loopState: number;
					isShuffled: boolean;
					isPlaylistMix: boolean;
					duration: number;
					currentTime: number;
				}
			>({
				func: (
					...args: {
						isPlaylist: boolean;
						isYoutubeMusic: boolean;
					}[]
				) => {
					const video = document.getElementById("movie_player") as any;
					let isPlaylistMix = false;
					if (args[0].isPlaylist) {
						const playlistTitle =
							Array.from(document.querySelectorAll("#container.ytd-playlist-panel-renderer"))
								.reverse()
								.find((el) => el.children.length !== 0)
								?.querySelector(".header")
								?.querySelector(".title")?.innerHTML ?? "";
						isPlaylistMix = playlistTitle.includes("Mix -");
					}
					let loopState = 0; // loop is turned off
					if (!isPlaylistMix && (args[0].isYoutubeMusic || args[0].isPlaylist)) {
						const playlistLoopState = args[0].isYoutubeMusic ? '[aria-label="Repeat all"]' : '[aria-label="Loop video"]';
						const videoLoopState = args[0].isYoutubeMusic ? '[aria-label="Repeat one"]' : '[aria-label="Turn off loop"]';
						if (document.querySelector(playlistLoopState)) {
							loopState = 1;
						} else if (document.querySelector(videoLoopState)) {
							loopState = 2;
						}
					} else {
						loopState = !!video?.getLoopVideo() ? 2 : 0;
					}

					const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]');
					const isShuffled = shuffleButton?.getAttribute("aria-pressed") === "true";
					return {
						volume: video?.getVolume() ?? 0,
						isPaused: document.querySelector("video")?.paused ?? false,
						loopState,
						isShuffled,
						isPlaylistMix,
						duration: video?.getDuration() ?? 0,
						currentTime: video?.getCurrentTime() ?? 0,
					};
				},
				target: { tabId: tab.id! },
				world: "MAIN",
				args: [{ isPlaylist, isYoutubeMusic }],
			});
			temp.push({
				isMuted: !!tab.mutedInfo?.muted,
				isYoutube: true,
				isYoutubeMusic,
				title: tab.title ?? "",
				volume: res[0].result.volume,
				isPlaylist,
				id: tab.id ?? 0,
				isPaused: res[0].result?.isPaused,
				iconUrl: tab.favIconUrl,
				loopState: res[0].result.loopState,
				isShuffled: res[0].result.isShuffled,
				isPlaylistMix: res[0].result.isPlaylistMix,
				currentTime: res[0].result.currentTime,
				duration: res[0].result.duration,
			});
		}
		tabs = temp;
	});
</script>

<div class="flex flex-col gap-2 w-full">
	{#each tabs as tab, i}
		<Tab {tab} idx={i} bind:tabs />
	{/each}
</div>
