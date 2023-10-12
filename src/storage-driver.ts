import type { IVideo } from './interfaces/video';

export type IStorage = {
	count: number;
	videos: Map<string, IVideo>;
	includedUrls: string[];
	isLight: boolean;
	rewindTime?: number; // in seconds
	forwardTime?: number; // in seconds
	alwaysLoop?: boolean;
};

export const storageDriver = {
	get: async (): Promise<IStorage> => {
		try {
			const value = await chrome.storage.sync.get();
			const jsonVideo = JSON.parse(value.videos ?? '[]');
			const storage: IStorage = {
				count: value.count ?? 0,
				videos: new Map(jsonVideo),
				includedUrls: value.includedUrls ?? [],
				isLight: value.isLight,
				rewindTime: value.rewindTime ?? 10,
				forwardTime: value.forwardTime ?? 10,
				alwaysLoop: value.alwaysLoop ?? false,
			};
			return storage;
		} catch (error) {
			throw error;
		}
	},
	set: (value: IStorage): Promise<void> => {
		const newValue = {
			...value,
			videos: JSON.stringify(Array.from(value.videos.entries())),
		};
		return chrome.storage.sync.set(newValue);
	},
};
