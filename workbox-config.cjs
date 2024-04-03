module.exports = {
	globDirectory: 'src/',
	globPatterns: ['**/*.{ts,html,pcss,js,svelte,css,jpg}'],
	swDest: 'static/sw.js',
	ignoreURLParametersMatching: [/^utm_/, /^fbclid$/]
};
