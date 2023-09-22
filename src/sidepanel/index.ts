// Side panel
// https://developer.chrome.com/docs/extensions/reference/sidePanel/

import App from './app.svelte';

const app = new App({
	target: document.getElementById('app')!,
});

export default app;
