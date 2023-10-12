<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../components/button.svelte';
	import Input from '../components/input.svelte';
	import { storage } from '../stores/store';
	import Switch from '../components/switch.svelte';

	let included = '';
	let message = '';
	let loop = false;

	onMount(() => {
		included = $storage.includedUrls.join(', ');
	});
</script>

<div class="flex flex-col items-center gap-4">
	<div class="w-full">
		<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Included URLs for Tab Control</label>
		<Input bind:inputValue={included} placeHolder="youtube.com, zoom.com" className="bg-light dark:bg-dark" />
	</div>
	<div class="flex gap-2">
		<div class="w-full">
			<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rewind Time (s)</label>
			<Input placeHolder="10" className="bg-light dark:bg-dark" />
		</div>
		<div class="w-full">
			<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Forward Time (s)</label>
			<Input placeHolder="10" className="bg-light dark:bg-dark" />
		</div>
	</div>
	<div class="flex items-center justify-between w-full">
		<span class="text-sm font-medium">Always loop Youtube (except playlist)</span>
		<Switch bind:isChecked={loop} />
	</div>
	<Button
		onClick={() => {
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
		}}>Save</Button
	>
	{#if message.length !== 0}
		<div>{message}</div>
	{/if}
</div>
