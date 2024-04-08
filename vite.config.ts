import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		minify: 'terser',
		cssMinify: 'lightningcss',
		target: ['es2015', 'chrome54'],
		cssTarget: ['chrome54']
	}
});
