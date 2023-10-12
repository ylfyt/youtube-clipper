<script lang="ts">
	import { onMount } from 'svelte';
	import { storageDriver } from '../storage-driver';
	import { storage } from './stores/store';
	import Home from './pages/home.svelte';
	import Container from './components/container.svelte';
	import MoonIcon from '../assets/svg/moon-icon.svelte';
	import SunIcon from '../assets/svg/sun-icon.svelte';

	let init = false;
	let included = '';
	let isLight = true;

	const updateTheme = () => {
		if (!init) {
			return;
		}
		storage.update((prev) => {
			prev.isLight = isLight;
			return prev;
		});

		console.log('test', isLight);

		if (isLight) {
			document.body.classList.remove('dark');
		} else {
			document.body.classList.add('dark');
		}
	};

	$: isLight, updateTheme();
	$: $storage,
		(async () => {
			if (!init) {
				return;
			}
			await storageDriver.set($storage);
		})();

	onMount(async () => {
		const res = await storageDriver.get();
		init = true;
		storage.set(res);

		isLight = res.isLight;
		included = res.includedUrls.join(',');
	});
</script>

<div class="h-screen bg-light dark:bg-dark text-dark dark:text-light flex justify-center">
	<Container>
		<div class="flex justify-between items-center px-2 my-2 lg:my-4">
			<h1 class="text-lg">Options</h1>
			<button
				class="fill-yellow-400"
				on:click={() => {
					isLight = !isLight;
				}}
			>
				{#if isLight}
					<MoonIcon width={18} />
				{:else}
					<SunIcon width={18} />
				{/if}
			</button>
		</div>
		<Home />
	</Container>
</div>
