import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from '../package.json';

const { version, name, description } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
	// can only contain digits, dots, or dash
	.replace(/[^\d.-]+/g, '')
	// split into version parts
	.split(/[.-]/);

export default defineManifest(async (env) => ({
	manifest_version: 3,
	name: 'Youtube Clipper',
	description: description,
	version: `${major}.${minor}.${patch}`,
	version_name: version,
	icons: {
		'16': 'src/assets/icons/icon16.png',
		'32': 'src/assets/icons/icon32.png',
		'48': 'src/assets/icons/icon48.png',
		'128': 'src/assets/icons/icon128.png',
	},
	content_scripts: [
		{
			matches: ['https://*/*'],
			js: ['src/content/index.ts'],
		},
	],
	background: {
		service_worker: 'src/background/index.ts',
	},
	options_ui: {
		page: 'src/options/index.html',
		open_in_tab: false,
	},
	side_panel: {
		default_path: 'src/sidepanel/index.html',
	},
	action: {
		default_popup: 'src/popup/index.html',
		default_icon: {
			'16': 'src/assets/icons/icon16.png',
			'32': 'src/assets/icons/icon32.png',
			'48': 'src/assets/icons/icon48.png',
			'128': 'src/assets/icons/icon128.png',
		},
	},
	commands: {
		'play-toggle': {
			suggested_key: {
				default: 'Alt+C',
			},
			description: 'Play/Pause the first Youtube video tab',
		},
	},
	permissions: ['activeTab', 'tabs', 'scripting', 'storage'] as chrome.runtime.ManifestPermissions[],
	host_permissions: ['http://*/', 'https://*/'],
	content_security_policy: {
		sandbox: "sandbox allow-scripts; script-src 'self' https://www.gstatic.com/ https://*.firebaseio.com https://www.googleapis.com",
	},
}));
