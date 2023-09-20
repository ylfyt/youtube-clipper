import { parseVideo } from './utils/parse-video';

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
	const res = await chrome.storage.local?.get(videoId);
	const video = parseVideo(res?.[videoId]);

	if (!video) {
		return;
	}

	// Select the video element on the YouTube page
	var videoElement = document.querySelector('video');

	if (video.start >= 0) {
		videoElement.currentTime = video.start;
	}

	if (video.start < 0) {
		video.start = 0;
	}

	if (video.end < 0) {
		return;
	}

	const listener = () => {
		const curr = videoElement.currentTime;
		if (curr < video.end) {
			return;
		}
		if (video.loop) {
			console.log(`============== LOOP ==============`);
			videoElement.currentTime = video.start;
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
}
