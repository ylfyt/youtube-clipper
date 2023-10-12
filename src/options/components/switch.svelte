<script lang="ts">
	export let isChecked: boolean | undefined = undefined;
	export let isDisabled: boolean | undefined = undefined;
</script>

<label class={`relative inline-flex items-center cursor-pointer ${isDisabled ? 'opacity-75' : ''}`}>
	<input type="checkbox" value="" class="sr-only peer" bind:checked={isChecked} disabled={isDisabled} />
	<div
		class="w-11 h-6 bg-gray-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
	/>
</label>
