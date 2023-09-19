import type { IVideo } from 'src/interfaces/video';

export function parseVideo(data: any): IVideo | null {
	if (!data) {
		return null;
	}
	const start = parseInt(data.start);
	if (Number.isNaN(start)) {
		return null;
	}
	const end = parseInt(data.end);
	if (Number.isNaN(end)) {
		return null;
	}

	return {
		start,
		end,
		loop: !!data.loop,
		title: data.title ?? '',
	};
}
