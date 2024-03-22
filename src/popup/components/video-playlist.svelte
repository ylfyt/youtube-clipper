<script lang="ts">
	import { onMount } from "svelte";

	export let tabId: number;
	export let refreshTabs: () => void;

	let titles: string[] = [];

	onMount(() => {
		getPlaylist();
	});

	const getPlaylist = async () => {
		const res = await chrome.scripting.executeScript({
			func: () => {
				const items = document.querySelectorAll(".playlist-items");
				let container: Element | undefined;
				for (const item of items) {
					if (item.children.length !== 0) {
						container = item;
						break;
					}
				}
				if (!container) return [];

				const title: string[] = [];
				container.querySelectorAll("#video-title").forEach((el) => {
					if (!(el instanceof HTMLElement)) return;
					title.push(el.innerText);
				});
				return title;
			},
			target: {
				tabId,
			},
			world: "MAIN",
		});

		titles = res[0].result;
	};

	const play = async (idx: number) => {
		await chrome.scripting.executeScript<number[], void>({
			func: (...ids: number[]) => {
				const items = document.querySelectorAll(".playlist-items");
				let container: Element | undefined;
				for (const item of items) {
					if (item.children.length !== 0) {
						container = item;
						break;
					}
				}
				if (!container) return;

				const endpoint = document.querySelectorAll("#wc-endpoint")[ids[0]];
				if (!(endpoint instanceof HTMLElement)) return;
				endpoint.click();
			},
			target: {
				tabId,
			},
			world: "MAIN",
			args: [idx],
		});

		refreshTabs();
	};
</script>

<div class="max-h-40 overflow-y-auto">
	<ul class="w-full flex flex-col gap-1">
		{#each titles as item, i}
			<li>
				<button class="border hover:bg-gray-300 dark:hover:bg-gray-800 text-left active:border-secondary border-color0 rounded w-full px-2 py-1" on:click={() => play(i)}>#{i + 1} {item}</button>
			</li>
		{/each}
	</ul>
</div>
