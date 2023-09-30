<script lang="ts">
	import type { IClipTime } from '../interfaces/clip-time';

	export let clip: IClipTime;

  function init(el: HTMLInputElement) {
		el.focus();
	}
</script>

<div class="flex gap-4 items-end w-full">
	<div class="w-full">
		<input
      use:init
			class="w-full p-2 text-dark rounded-md bg-light border-2 border-color0 dark:bg-dark dark:text-light"
			type="text"
			placeholder="Start HH:MM:SS"
			bind:value={clip.start}
		/>
	</div>
	<div class="w-full">
		<input
			class="w-full p-2 text-dark rounded-md bg-light border-2 border-color0 dark:bg-dark dark:text-light"
			type="text"
			placeholder="End HH:MM:SS"
			bind:value={clip.end}
		/>
	</div>
</div>
