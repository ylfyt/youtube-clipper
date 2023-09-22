// Action popup
// https://developer.chrome.com/docs/extensions/reference/action/

import App from './app.svelte';
import './index.css'

const app = new App({
	target: document.getElementById('app')!,
});

export default app;
