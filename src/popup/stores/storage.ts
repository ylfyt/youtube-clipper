import { writable } from 'svelte/store';
import type { IStorage } from '../../interfaces/storage';

export const storage = writable<IStorage>({
	count: 0,
	videos: new Map(),
	includedUrls: [],
  isLight: false
});
