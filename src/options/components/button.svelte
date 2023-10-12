<script lang="ts">
	export let onClick: (() => void) | undefined = undefined;
	export let className: string | undefined = undefined;
</script>

<button on:click={onClick} class={`${className ?? ''} bg-color0 rounded flex justify-center py-1 px-2 items-center fill-dark dark:fill-light active:opacity-80`}>
	<slot />
</button>
