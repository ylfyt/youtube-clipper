<script lang="ts">
	import { onMount } from 'svelte';
	import { storageDriver } from '../storage-driver';
	import { storage } from './stores/store';

	let init = false;
	let included = '';
	let message = '';

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

		included = res.includedUrls.join(',');
	});
</script>

<div>
	<h1>Options</h1>
	<input bind:value={included} />
	<button
		on:click={() => {
			const stringWithoutSpaces = included
				.split('')
				.filter((char) => !/\s/.test(char))
				.join('');
			storage.update((prev) => {
				if (stringWithoutSpaces == '') {
					prev.includedUrls = [];
				} else {
					prev.includedUrls = stringWithoutSpaces.split(',');
				}
				return prev;
			});
			message = 'Saved';
		}}>Save</button
	>
	{#if message.length !== 0}
		<div>{message}</div>
	{/if}
</div>
