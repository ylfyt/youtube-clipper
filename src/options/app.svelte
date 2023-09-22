<script lang="ts">
	import { onMount } from 'svelte';
	import Options from '../components/Options.svelte';
	import { storageDriver } from '../storage';

	let count = 0;

	onMount(() => {
		storageDriver.get().then((storage) => (count = storage.count));
	});
</script>

<div>
	<h1>Options</h1>
	<Options {count} />
</div>
