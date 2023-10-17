import { writable } from 'svelte/store';
import type { IStorage } from '../../storage-driver';

export const storage = writable<IStorage>({
	videos: {},
	includedUrls: [],
  isLight: false
});
