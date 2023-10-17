<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../components/button.svelte';
	import Input from '../components/input.svelte';
	import { storage } from '../stores/store';
	import Switch from '../components/switch.svelte';

	let included = '';
	let message = '';
	let loop = false;
	let rewindTime: string = '';
	let forwardTime: string = '';

	onMount(() => {
		included = $storage.includedUrls.join(', ');
		rewindTime = $storage.rewindTime!.toString();
		forwardTime = $storage.forwardTime!.toString();
		loop = $storage.alwaysLoop!;
	});

	const save = async () => {
		const rewind = parseInt(rewindTime);
		const forward = parseInt(forwardTime);
		if (isNaN(rewind) || rewind < 0) {
			message = 'Rewind time must be > 0';
			return;
		}
		if (isNaN(forward) || forward < 0) {
			message = 'Forward time must be > 0';
			return;
		}

		const stringWithoutSpaces = included
			.split('')
			.filter((char) => !/\s/.test(char))
			.join('');

		storage.update((prev) => {
			prev.lastSync = new Date().getTime();
			if (stringWithoutSpaces == '') {
				prev.includedUrls = [];
			} else {
				prev.includedUrls = stringWithoutSpaces.split(',');
			}
			prev.rewindTime = rewind;
			prev.forwardTime = forward;
			prev.alwaysLoop = loop;
			return prev;
		});
		message = 'Saved';
	};
</script>

<div class="flex flex-col items-center gap-4">
	<div class="w-full">
		<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Included URLs for Tab Control</label>
		<Input bind:value={included} placeholder="youtube.com, zoom.com" />
	</div>
	<div class="flex gap-2 w-full">
		<div class="w-full">
			<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rewind Time (s)</label>
			<Input bind:value={rewindTime} placeholder="10" />
		</div>
		<div class="w-full">
			<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Forward Time (s)</label>
			<Input bind:value={forwardTime} placeholder="10" />
		</div>
	</div>
	<div class="flex items-center justify-between w-full">
		<span class="text-sm font-medium">Always loop Youtube (except playlist)</span>
		<Switch bind:isChecked={loop} />
	</div>
	<Button onClick={() => save()}>Save</Button>
	{#if message.length !== 0}
		<div>{message}</div>
	{/if}
</div>
