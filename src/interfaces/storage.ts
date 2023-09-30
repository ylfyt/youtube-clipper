import type { IVideo } from './video';

export type IStorage = {
	count: number;
	videos: Map<string, IVideo>;
	includedUrls: string[];
  isLight: boolean
};
