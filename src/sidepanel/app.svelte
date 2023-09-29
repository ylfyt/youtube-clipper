<script lang="ts">
	import { onMount } from 'svelte';
	import { storageDriver } from '../storage-driver';

	let count = 0;

	onMount(() => {
		storageDriver.get().then((storage) => (count = storage.count));
	});
</script>

<div>
	<h1>Side Panel</h1>
</div>
