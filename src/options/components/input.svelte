<script lang="ts">
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

	export let className: string | undefined = undefined;
	export let placeholder: string | undefined = undefined;
	export let required: boolean | undefined | null = undefined;
	export let value: any | undefined = undefined;
	export let type: HTMLInputTypeAttribute | null | undefined = undefined;

	const handleInput = (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		const target = e.target as HTMLInputElement;
		value = target.value;
	};
</script>

<input
	{value}
	{type}
	on:input={handleInput}
	class={`${
		className ?? ''
	} bg-light dark:bg-dark rounded-lg w-full p-2.5 text-sm focus:outline-none border-2 border-gray-300 dark:border-gray-800 focus:border-blue-400 dark:focus:border-blue-400 dark:placeholder:text-gray-600`}
	{required}
	{placeholder}
/>
