import type { IStorage } from './interfaces/storage';

export const storageDriver = {
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
