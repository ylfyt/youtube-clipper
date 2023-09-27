<script lang="ts">
	export let bgColor: string = 'bg-secondary';
	export let width: string = 'w-[30px]';
	export let onClick: (() => void) | undefined = undefined;
</script>

<button on:click={onClick} class={`${bgColor} ${width} py-0.5 rounded flex justify-center items-center fill-white`}> <slot /> </button>
