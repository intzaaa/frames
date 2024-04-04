import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import packageJson from './package.json' assert { type: 'json' };
import * as cp from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess({})],
	kit: {
		adapter: adapter(),
		version: {
			name: packageJson.version + '-' + cp.execSync('git rev-parse --short HEAD').toString().trim()
		}
	}
};

export default config;
