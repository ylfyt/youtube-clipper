<script lang="ts">
	import type { IClipTime } from '../interfaces/clip-time';

	export let clip: IClipTime;
</script>

<div class="flex gap-4 items-end w-full">
	<div class="w-full">
		<input
			class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500"
			type="text"
			placeholder="Start HH:MM:SS"
			bind:value={clip.start}
		/>
	</div>
	<div class="w-full">
		<input
			class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500"
			type="text"
			placeholder="End HH:MM:SS"
			bind:value={clip.end}
		/>
	</div>
	<div class="flex flex-col justify-center items-start">
		<input
			bind:checked={clip.loop}
			id="checked-checkbox"
			type="checkbox"
			value=""
			class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
		/>
		<label for="checked-checkbox" class="text-xs font-medium text-gray-900 dark:text-gray-300">LOOP</label>
	</div>
</div>
