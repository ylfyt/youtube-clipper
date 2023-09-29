import type { IStorage } from './interfaces/storage';

export const storageDriver = {
	get: async (): Promise<IStorage> => {
		try {
			const value = await chrome.storage.sync.get();
			const jsonVideo = JSON.parse(value.videos ?? '[]');
			const storage: IStorage = {
				count: value.count ?? 0,
				videos: new Map(jsonVideo),
				includedUrls: value.includedUrls ?? [],
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
