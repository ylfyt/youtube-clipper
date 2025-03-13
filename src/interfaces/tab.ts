export interface ITab {
	id: number;
	title: string;
	isYoutube: boolean;
	isYoutubeMusic?: boolean;
	isMuted: boolean;
	isPlaylist: boolean;
	isPlaylistMix: boolean;
	isPaused: boolean;
	volume: number;
	iconUrl?: string;
	loopState: number;
	isShuffled?: boolean;
	duration: number;
	currentTime: number;
}
