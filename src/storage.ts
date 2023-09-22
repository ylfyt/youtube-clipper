import type { IVideo } from './interfaces/video';

type IStorage = {
	count: number;
	videos: Map<string, IVideo>;
};

const defaultStorage: IStorage = {
	count: 0,
	videos: new Map(),
};

export const storage = {
	get: async (): Promise<IStorage> => {
		try {
			const value = await chrome.storage.sync.get();
			const storage: IStorage = {
				count: value.count ?? 0,
				videos: new Map(JSON.parse(value.videos ?? '[]')),
			};
			return storage;
		} catch (error) {
			throw error;
		}
	},
	set: (value: IStorage): Promise<void> => {
		const newValue = {
			count: value.count,
			videos: JSON.stringify(Array.from(value.videos.entries())),
		};
		return chrome.storage.sync.set(newValue);
	},
};
