<script lang="ts">
	import { storage } from '../stores/store';

	let included = '';
	let message = '';
</script>

<div>
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
