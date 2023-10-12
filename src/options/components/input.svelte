<script lang="ts">
	export let className: string | undefined = undefined;
	export let placeHolder: string | undefined = undefined;
	export let isRequired: boolean | undefined | null = undefined;
	export let inputValue: any | undefined = undefined;
</script>

<input
	bind:value={inputValue}
	type="text"
	id="first_name"
	class={`${
		className ?? ''
	} rounded-lg w-full p-2.5 text-sm focus:outline-none border-2 border-gray-300 dark:border-gray-800 focus:border-blue-400 dark:focus:border-blue-400 dark:placeholder:text-gray-600`}
	required={isRequired}
	placeholder={placeHolder}
/>
