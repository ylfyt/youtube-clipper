import { storageDriver, type IStorage } from '../storage-driver';

console.log('================= YT CLIPPER =================');

let prevId = '';
let storage: IStorage | undefined
let controller: AbortController | undefined
let adsObserver: MutationObserver | undefined
let prevPlayerType: 'video' | 'playlist' | undefined

async function main() {
	if (window.location.href.indexOf('youtube.com') === -1) {
		return;
	}
	storage = await storageDriver.get();
	if (!storage) {
		return
	}
	const observer = new MutationObserver(observerCallback);
	observer.observe(document.body, { attributes: false, childList: true, subtree: false });
}
main();


async function observerCallback() {
	// autoSkipAdHandler()
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

function getRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function executeVideo(videoId: string) {
	const isPlaylist = window.location.href.indexOf('list=') !== -1;
	if (isPlaylist && prevPlayerType !== 'playlist' && storage!.alwaysShuffle) {
		setTimeout(() => {
			console.log('PERFORM ALWAYS SHUFFLE');
			const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]') as HTMLButtonElement;
			const isShuffled = shuffleButton?.getAttribute('aria-pressed') === 'true';
			if (!isShuffled) {
				shuffleButton?.click();
			}
		}, 2000);
	}
	prevPlayerType = isPlaylist ? 'playlist' : 'video'
	// if (!isPlaylist && storage!.alwaysLoop) {
	// setTimeout(() => {
	// 	console.log('PERFORM ALWAYS LOOP');
	// 	document.querySelector('video')?.setAttribute('loop', 'true');
	// }, 2000);
	// }

	const video = storage!.videos[videoId];
	if (!video) {
		return;
	}

	// Select the video element on the YouTube page
	let videoElement = document.querySelector('video');
	if (videoElement == null) {
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
		const curr = videoElement!.currentTime;
		if (curr < video.clips[clipPosition].end) {
			return;
		}
		clipPosition++;

		if (clipPosition < video.clips.length) {
			videoElement!.currentTime = video.clips[clipPosition].start;
			return;
		}

		if (isPlaylist) {
			controller?.abort();
			controller = undefined;

			const playlist = document.querySelectorAll('#playlist-items');
			if (playlist.length === 0) {
				console.log('WHY 0???');
				return;
			}

			const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]') as HTMLButtonElement;
			const isShuffled = shuffleButton?.getAttribute('aria-pressed') === 'true';
			if (isShuffled) {
				const nextIdx = getRandomNumber(0, playlist.length - 1);
				const a = playlist.item(nextIdx).children[0] as any;
				a.click();
				return;
			}

			const idx = parseInt(new URLSearchParams(window.location.href).get('index') ?? '') ?? 1;
			let nextIdx = idx + 1;
			if (nextIdx >= playlist.length) {
				nextIdx = 1;
			}
			(playlist.item(nextIdx - 1).children[0] as any).click();
			return;
		}

		if (video.loop) {
			console.log(`============== LOOP ==============`);
			clipPosition = 0;
			videoElement!.currentTime = video.clips[0].start;
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

function autoSkipAdHandler() {
	if (!storage?.autoSkipAd || adsObserver) {
		return
	}
	const adsContainer: HTMLElement | null = document.querySelector('.video-ads');
	if (!adsContainer) {
		return;
	}
	console.log('PERFORM AUTO SKIP');
	const mutationCallback = function (mutations: MutationRecord[], observer: MutationObserver) {
		if (mutations.length === 0) {
			return;
		}
		if (mutations[0].addedNodes.length === 0) {
			return;
		}
		console.log('NEW ADS');
		setTimeout(() => {
			console.log('TRYING TO SKIP');
			const button: HTMLButtonElement | null = document.querySelector('.ytp-ad-skip-button');
			if (!button) {
				console.log('NO SKIP BUTTON');
				return;
			}
			console.log('PERFOM SKIP ADS');
			button.click();
		}, 1000);
	};
	adsObserver = new MutationObserver(mutationCallback);
	adsObserver.observe(adsContainer, { childList: true });
}