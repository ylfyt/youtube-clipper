const added = {};
let controller;

const process = (videoId) => {
	chrome.storage.local?.get(videoId, (res) => {
		const time = res[videoId];
		if (!time) {
			return;
		}
		console.log(time);

		// Select the video element on the YouTube page
		var videoElement = document.querySelector('video');

		if (typeof time.start !== 'undefined') {
			videoElement.currentTime = time.start;
		}

		if (!time.start) {
			time.start = 0;
		}

		if (typeof time.end === 'undefined') {
			return;
		}

		const listener = (e) => {
			const curr = videoElement.currentTime;
			if (curr < time.end) {
				return;
			}
			if (time.loop) {
				console.log(`============== LOOP ==============`);
				videoElement.currentTime = time.start;
				return;
			}

			const isPlaylist = window.location.href.indexOf('list=') !== -1;
			console.log(`============== END: ${isPlaylist ? 'NEXT' : 'PAUSE'} ==============`);
			const keyEvent = new KeyboardEvent('keydown', {
				key: isPlaylist ? 'n' : 'k',
				keyCode: isPlaylist ? 78 : 75,
				code: isPlaylist ? 'KeyN' : 'KeyK',
				which: isPlaylist ? 78 : 75,
				shiftKey: isPlaylist ? true : false,
				ctrlKey: false,
				metaKey: false,
			});

			document.dispatchEvent(keyEvent);
			controller?.abort();
			controller = undefined;
		};
		videoElement.addEventListener('timeupdate', listener);

		controller = new AbortController();
		controller.signal.onabort = () => {
			console.log('============ ABORT ============');
			videoElement.removeEventListener('timeupdate', listener);
		};
	});
};

function addLocationObserver(callback) {
	const config = { attributes: false, childList: true, subtree: false };
	const observer = new MutationObserver(callback);

	observer.observe(document.body, config);
}

let prevId = '';
function observerCallback() {
	if (window.location.href.indexOf('youtube.com/watch') === -1) {
		console.log('not yt');
		return;
	}

	const regex = /[?&]v=([^&#]+)/;
	const match = window.location.href.match(regex);

	const videoId = match && match[1];
	if (videoId === prevId) {
		return;
	}
	prevId = videoId;
	controller?.abort();

	console.log(`============ PROCESS ${videoId} ============`);
	process(videoId);
}

addLocationObserver(observerCallback);
observerCallback();
