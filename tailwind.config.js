/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#2e6d81',
				secondary: '#ff1e56',
			},
		},
	},
	plugins: [],
	darkMode: 'class',
};
