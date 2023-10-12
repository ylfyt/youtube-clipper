<script lang="ts">
	export let bgColor: string = 'bg-secondary';
	export let width: string = 'w-[24px]';
	export let onClick: (() => void) | undefined = undefined;
	export let hide = false;
	export let title = '';
</script>

<button {title} on:click={onClick} class={`${bgColor} ${width} rounded flex justify-center h-[24px] items-center fill-dark dark:fill-light ${hide ? 'invisible' : 'visible'}`}> <slot /> </button>
