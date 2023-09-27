import type { IVideoClip } from './clip-time';

export interface IVideo {
	id: string;
	title: string;
	clips: IVideoClip[];
	loop: boolean;
}
