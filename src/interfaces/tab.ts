export interface ITab {
	id?: number;
	title: string;
	isYoutube: boolean;
	isMuted: boolean;
	isPlaylist: boolean;
	isPaused: boolean;
	volume: number;
	iconUrl?: string;
	isLoop: boolean;
}
