<script lang="ts">
	export let onClick: (() => void) | undefined = undefined;
	export let hide = false;
</script>

<button
	type="button"
	on:click={onClick}
	class={`bg-red-400 rounded-full p-2 inline-flex items-center justify-center text-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${hide ? 'invisible' : ''}`}
>
	<svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
	</svg>
</button>
