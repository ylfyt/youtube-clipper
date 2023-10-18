import { storageDriver } from '../storage-driver';

console.log('================= YT CLIPPER =================');

let controller: AbortController | undefined;

function addLocationObserver(callback: MutationCallback) {
	const config = { attributes: false, childList: true, subtree: false };
	const observer = new MutationObserver(callback);

	observer.observe(document.body, config);
}

let prevId = '';
function observerCallback() {
	if (window.location.href.indexOf('youtube.com/watch') === -1) {
		return;
	}
	const regex = /[?&]v=([^&#]+)/;
	const match = window.location.href.match(regex);

	const videoId = match && match[1];
	if (!videoId) {
		return;
	}
	if (videoId === prevId) {
		return;
	}
	prevId = videoId;
	controller?.abort();

	console.log(`============ PROCESS ${videoId} ============`);
	executeVideo(videoId);
}

addLocationObserver(observerCallback);
observerCallback();

interface IVideo {
	loop: boolean;
	start: number;
	end: number;
	title: string;
	id: string;
}

async function executeVideo(videoId: string) {
	const storage = await storageDriver.get();
	const isPlaylist = window.location.href.indexOf('list=') !== -1;
	if (isPlaylist && storage.alwaysShuffle) {
		setTimeout(() => {
			console.log('PERFORM ALWAYS SHUFFLE');
			const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]') as HTMLButtonElement;
			const isShuffled = shuffleButton?.getAttribute('aria-pressed') === 'true';
			if (!isShuffled) {
				shuffleButton?.click();
			}
		}, 2000);
	}
	if (!isPlaylist && storage.alwaysLoop) {
		setTimeout(() => {
			console.log('PERFORM ALWAYS LOOP');
			document.querySelector('video')?.setAttribute('loop', 'true');
		}, 2000);
	}

	const video = storage.videos[videoId];
	if (!video) {
		return;
	}

	// Select the video element on the YouTube page
	var videoElement = document.querySelector('video');
	if (!videoElement) {
		return;
	}
	let clipPosition = 0;

	if (video.clips[clipPosition].start >= 0) {
		videoElement.currentTime = video.clips[clipPosition].start;
	}

	if (video.clips[clipPosition].start < 0) {
		video.clips[clipPosition].start = 0;
	}

	if (video.clips[clipPosition].end < 0) {
		return;
	}

	const listener = () => {
		if (!videoElement) {
			return;
		}
		const curr = videoElement.currentTime;
		if (curr < video.clips[clipPosition].end) {
			return;
		}
		clipPosition++;

		if (clipPosition < video.clips.length) {
			videoElement.currentTime = video.clips[clipPosition].start;
			return;
		}

		const isPlaylist = window.location.href.indexOf('list=') !== -1;
		if (isPlaylist) {
			const keyEvent = new KeyboardEvent('keydown', {
				key: 'n',
				keyCode: 78,
				code: 'KeyN',
				which: 78,
				shiftKey: true,
				ctrlKey: false,
				metaKey: false,
			});
			document.dispatchEvent(keyEvent);
			controller?.abort();
			controller = undefined;
			return;
		}

		if (video.loop) {
			console.log(`============== LOOP ==============`);
			clipPosition = 0;
			videoElement.currentTime = video.clips[0].start;
			return;
		}

		const keyEvent = new KeyboardEvent('keydown', {
			key: 'k',
			keyCode: 75,
			code: 'KeyK',
			which: 75,
			shiftKey: false,
			ctrlKey: false,
			metaKey: false,
		});
		document.dispatchEvent(keyEvent);
		clipPosition = 0;
		controller?.abort();
		controller = undefined;
	};
	videoElement.addEventListener('timeupdate', listener);

	controller = new AbortController();
	controller.signal.onabort = () => {
		console.log('============ ABORT ============');
		videoElement!.removeEventListener('timeupdate', listener);
	};
}
