<script lang="ts">
	import { onMount } from "svelte";

	export let tabId: number;
	export let refreshTabs: () => void;

	let metas: { title: string; channel: string; idx: number }[] = [];

	let search = "";
	$: showedMetas = search.length < 2 ? metas : metas.filter((el) => `${el.title} ${el.channel}`.toLowerCase().includes(search));

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

				const meta: { title: string; channel: string; idx: number }[] = [];
				container.querySelectorAll("#meta").forEach((el) => {
					const title = (el.querySelector("#video-title") as HTMLElement).innerText;
					const channel = (el.querySelector("#byline") as HTMLElement).innerText;
					meta.push({
						title,
						channel,
						idx: meta.length,
					});
				});
				return meta;
			},
			target: {
				tabId,
			},
			world: "MAIN",
		});

		metas = res[0].result;
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

<div>
	<input bind:value={search} class="bg-light px-2 py-0.5 mb-1 text-xs dark:bg-dark outline-none ring-0 border rounded border-color0" placeholder="Search..." type="text" />
	<div class="h-40 overflow-y-auto">
		<ul class="w-full flex flex-col gap-1">
			{#each showedMetas as item, i}
				<li>
					<button class="border hover:bg-gray-300 dark:hover:bg-gray-800 text-left active:border-secondary border-color0 rounded w-full px-2 py-1" on:click={() => play(item.idx)}>
						<span>
							#{i + 1}
						</span>
						<span>{item.title}</span>
						|
						<span class="text-secondary">{item.channel}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
