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

	let tabs: ITab[] = [];

	onMount(async () => {
		const chromeTabs = await chrome.tabs.query({});
		const temp: ITab[] = [];
		for (let tab of chromeTabs) {
			const isYoutube = tab.url?.includes('youtube.com/watch') || tab.url?.includes('youtube.com/shorts');
			if (!isYoutube) {
				temp.push({
					isMuted: !!tab.mutedInfo?.muted,
					isYoutube: false,
					title: tab.title ?? '',
					volume: 0,
					isPlaylist: false,
					id: tab.id,
				});
				continue;
			}

			const res = await chrome.scripting.executeScript({
				func: () => {
					const video = document.getElementById('movie_player') as any;
					return video?.getVolume() ?? 0;
				},
				target: { tabId: tab.id! },
				world: 'MAIN',
			});
			temp.push({
				isMuted: !!tab.mutedInfo?.muted,
				isYoutube: true,
				title: tab.title ?? '',
				volume: res?.[0]?.result ?? 0,
				isPlaylist: !!tab.url?.includes('list='),
				id: tab.id,
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
</script>

<div class="flex flex-col gap-2">
	{#each tabs as tab}
		<div class="flex justify-between p-2 bg-primary gap-2 rounded text-white flex-col">
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
						<Button>
							<MinusIcon width={14} />
						</Button>
						<span class="bg-[#abdeee] text-black w-[30px] py-0.5 rounded flex items-center justify-center h-full">{tab.volume}</span>
						<Button>
							<PlusIcon width={14} />
						</Button>
					</div>
				{/if}
				{#if tab.isPlaylist}
					<div class="flex items-center justify-center gap-2">
						<Button>
							<PrevIcon width={14} />
						</Button>
						<Button>
							<PauseIcon width={14} />
						</Button>
						<Button>
							<NextIcon width={14} />
						</Button>
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
