import { writable } from 'svelte/store';
import type { IStorage } from '../../storage-driver';

export const storage = writable<IStorage>({
	count: 0,
	videos: new Map(),
	includedUrls: [],
	isLight: false,
});
