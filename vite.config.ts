import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	build: {
		outDir: './dist',
		lib: {
			entry: [resolve(__dirname, './index.html'), resolve(__dirname, './src/content-script.ts')],
			name: '1',
			formats: ['es'],
			fileName: (format, entryName) => {
				const extension = format === 'es' ? 'js' : 'cjs';
				return `${entryName}.${extension}`;
			},
		},
	},
});
