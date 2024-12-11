<script lang="ts">
	import { onMount } from "svelte";

	export let tabId: number;
	export let refreshTabs: () => void;

	let metas: { title: string; channel: string; idx: number; selected?: boolean }[] = [];
	let metaElements: (HTMLButtonElement | null | undefined)[] = [];

	let search = "";
	$: showedMetas = search.length < 2 ? metas : metas.filter((el) => `${el.title} ${el.channel}`.toLowerCase().includes(search.toLowerCase()));

	$: metaElements.find((el) => el?.id === "selected")?.scrollIntoView();

	onMount(() => {
		document.getElementById("search-input")?.focus();
		getPlaylist();
	});

	const getPlaylist = async () => {
		const res = await chrome.scripting.executeScript({
			func: () => {
				const container = Array.from(document.querySelectorAll(".playlist-items"))
					.reverse()
					.find((el) => el.children.length !== 0);
				if (!container || !(container instanceof HTMLElement)) return [];

				const meta: { title: string; channel: string; idx: number; selected?: boolean }[] = [];
				for (let i = 0; i < container.children.length; i++) {
					const el = container.children[i];
					if (!el.querySelector("#meta")) continue;

					const title = (el.querySelector("#video-title") as HTMLElement).innerText;
					const channel = (el.querySelector("#byline") as HTMLElement).innerText;
					meta.push({
						title,
						channel,
						idx: meta.length,
						selected: el.hasAttribute("selected"),
					});
				}
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
				const container = Array.from(document.querySelectorAll(".playlist-items"))
					.reverse()
					.find((el) => el.children.length !== 0);
				if (!container) return;

				const endpoint = container.querySelectorAll("#wc-endpoint")[ids[0]];
				if (!(endpoint instanceof HTMLElement)) return;
				endpoint.click();
			},
			target: {
				tabId,
			},
			world: "MAIN",
			args: [idx],
		});

		metas.forEach((el, i) => {
			el.selected = idx === i;
		});
		metas = [...metas];
		refreshTabs();
	};
</script>

<div>
	<input id="search-input" bind:value={search} class="bg-light px-2 py-0.5 mb-1 text-xs dark:bg-dark outline-none ring-0 border rounded border-color0" placeholder="Search..." type="text" />
	<div class="max-h-52 overflow-y-auto">
		<div id="hello" class="w-full flex flex-col gap-1">
			{#each showedMetas as item, i (i)}
				<button
					id={item.selected ? "selected" : ""}
					bind:this={metaElements[i]}
					disabled={item.selected}
					class="border disabled:bg-gradient-to-r disabled:from-color0 disabled:via-purple-500 disabled:to-secondary disabled:text-black hover:enabled:bg-gray-300 dark:hover:enabled:bg-gray-800 text-left active:border-secondary outline-none focus:border-secondary border-color0 rounded w-full px-2 py-1"
					on:click={() => play(item.idx)}
				>
					<span>
						#{i + 1}
					</span>
					<span>{item.title}</span>
					|
					<span class={`${item.selected ? "text-white" : "text-secondary"}`}>{item.channel}</span>
				</button>
			{/each}
		</div>
	</div>
</div>
