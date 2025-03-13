export type SetYtVolumeArgs = number[];
export const setYtVolume = (...volumes: SetYtVolumeArgs): number => {
	const video: any = document.getElementById("movie_player");
	video.setVolume(volumes[0]);
	return video.getVolume();
};

export type DispatchYtEventArgs = KeyboardEventInit[];
export const dispatchYtEvent = (...events: DispatchYtEventArgs): void => {
	document.dispatchEvent(new KeyboardEvent("keydown", events[0]));
};

export const shuffleYt = () => {
	const shuffleButton = document.querySelector('[aria-label="Shuffle playlist"]') as HTMLButtonElement;
	shuffleButton?.click();
};

export type SeekVideoYtArgs = { second: number; to?: number }[];
export const seekVideoYt = (...args: SeekVideoYtArgs) => {
	const video: any = document.getElementById("movie_player");
	if (!video) return;
	if (args[0].to) return video.seekTo(args[0].to);

	video.seekBy(args[0].second);
};

export const getVideoState = (): { duration: number; current: number } => {
	const video: any = document.getElementById("movie_player");
	return {
		duration: video?.getDuration() ?? 0,
		current: video?.getCurrentTime() ?? 0,
	};
};

export type ToggleLoopYtArgs = { isPlaylist: boolean; isYoutubeMusic: boolean }[];
export const toggleLoopYt = (
	...args: ToggleLoopYtArgs
): {
	loopState: number;
} => {
	if (!args[0].isPlaylist) {
		const video: any = document.getElementById("movie_player");
		video && video.setLoopVideo(!video.getLoopVideo());
		return { loopState: !!video?.getLoopVideo() ? 2 : 0 };
	}

	const playlistTitle =
		Array.from(document.querySelectorAll("#container.ytd-playlist-panel-renderer"))
			.reverse()
			.find((el) => el.children.length !== 0)
			?.querySelector(".header")
			?.querySelector(".title")?.innerHTML ?? "";
	if (playlistTitle.includes("Mix -")) {
		const video: any = document.getElementById("movie_player");
		video && video.setLoopVideo(!video.getLoopVideo());
		return { loopState: !!video?.getLoopVideo() ? 2 : 0 };
	}

	const playlistLoopState = args[0].isYoutubeMusic ? '[aria-label="Repeat all"]' : '[aria-label="Loop video"]';
	const videoLoopState = args[0].isYoutubeMusic ? '[aria-label="Repeat one"]' : '[aria-label="Turn off loop"]';

	let loopState = 0;
	if (document.querySelector(playlistLoopState)) {
		loopState = 1;
	} else if (document.querySelector(videoLoopState)) {
		loopState = 2;
	}

	let button: any;
	if (args[0].isYoutubeMusic) {
		button = document.querySelector('[aria-label="Repeat one"]') || document.querySelector('[aria-label="Repeat all"]') || document.querySelector('[aria-label="Repeat off"]');
	} else {
		button = document.querySelector('[aria-label="Loop video"]') || document.querySelector('[aria-label="Loop playlist"]') || document.querySelector('[aria-label="Turn off loop"]');
	}
	button?.click();
	loopState++;
	if (loopState > 2) {
		loopState = 0;
	}
	return { loopState };
};

export const YtEvents: Record<string, () => KeyboardEventInit> = {
	next: () => ({
		key: "N",
		keyCode: 78,
		which: 78,
		shiftKey: true,
		ctrlKey: false,
		metaKey: false,
	}),
	prev: () => ({
		key: "P",
		keyCode: 80,
		which: 80,
		shiftKey: true,
		ctrlKey: false,
		metaKey: false,
	}),
	playToggleMusic: () => ({
		key: " ",
		keyCode: 32,
		which: 32,
		shiftKey: false,
		ctrlKey: false,
		metaKey: false,
	}),
	playToggle: () => ({
		key: "k",
		keyCode: 75,
		code: "KeyK",
		which: 75,
		shiftKey: false,
		ctrlKey: false,
		metaKey: false,
	}),
	shuffleMusic: () => ({
		key: "s",
		keyCode: 83,
		which: 83,
		shiftKey: false,
		ctrlKey: false,
		metaKey: false,
	}),
} as const;
