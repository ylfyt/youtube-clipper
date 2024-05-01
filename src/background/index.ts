chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'play-toggle') {
        playToggle();
        return;
    }
});



async function playToggle() {
    const tabs = await chrome.tabs.query({});
    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const isYoutubeMusic = !!tab.url?.includes('music.youtube.co');
        if (!isYoutubeMusic && !tab.url?.includes('youtube.com/watch?v=')) continue;

        if (isYoutubeMusic) {
            await chrome.scripting.executeScript({
                func: () => {
                    document.dispatchEvent(
                        new KeyboardEvent('keydown', {
                            key: ' ',
                            keyCode: 32,
                            which: 32,
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
}