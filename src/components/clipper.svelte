<script lang="ts">
	export let tab: chrome.tabs.Tab;
</script>

<div>
	<h3 id="title">{tab.title}</h3>
	<div style="margin-bottom: 10px">
		<div style="display: flex; gap: 10px">
			<div>
				<div>Start</div>
				<input type="text" id="start" placeholder="HH:MM:SS" />
			</div>
			<div>
				<div>End</div>
				<input type="text" id="end" placeholder="HH:MM:SS" />
			</div>
		</div>
		<div style="display: flex">
			<div>Loop:</div>
			<input type="checkbox" id="loop" />
		</div>
	</div>
	<button id="save-button">Save</button>
	<button id="clear-button">Clear</button>
</div>
