import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
    emptyOutDir: false,
		rollupOptions: {
			input: 'src/content-script.ts',
			output: {
				entryFileNames: '[name].js',
			},
		},
	},
});
