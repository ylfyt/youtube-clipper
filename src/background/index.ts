chrome.commands.onCommand.addListener(async (command) => {
	if (command === 'play-toggle') {
		const tabs = await chrome.tabs.query({});
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (!tab.url?.includes('youtube.com/watch?v=')) continue;
			await chrome.scripting.executeScript({
				func: () => {
					document.dispatchEvent(
						new KeyboardEvent('keydown', {
							key: 'k',
							keyCode: 75,
							code: 'KeyK',
							which: 75,
							shiftKey: false,
							ctrlKey: false,
							metaKey: false,
						})
					);
				},
				target: {
					tabId: tab.id!,
				},
			});
			return;
		}
		return;
	}
});
