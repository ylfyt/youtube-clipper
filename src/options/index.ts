// Options
// https://developer.chrome.com/docs/extensions/mv3/options/

import App from './app.svelte';
import './index.css';

const app = new App({
	target: document.getElementById('app')!,
});

export default app;
