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
</div>
