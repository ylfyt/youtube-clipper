<script lang="ts">
	export let onClick: (() => void) | undefined = undefined;
</script>

<button class="w-full h-auto" on:click={onClick}>
	<div class="flex-1 h-full">
		<div class="flex items-center justify-center flex-1 h-full p-2 bg-color0 shadow rounded-md">
			<div class="relative">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</div>
		</div>
	</div>
</button>
