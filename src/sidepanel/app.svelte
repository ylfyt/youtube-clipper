<script lang="ts">
	import { onMount } from 'svelte';
	import Options from '../components/Options.svelte';
	import { storage } from '../storage';

	let count = 0;

	onMount(() => {
		storage.get().then((storage) => (count = storage.count));
	});
</script>

<div>
	<h1>Side Panel</h1>
	<Options {count} />
</div>
