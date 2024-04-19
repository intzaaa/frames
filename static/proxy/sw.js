importScripts('uv.bundle.js');
importScripts('uv.config.js');
importScripts(__uv$config.sw || 'uv.sw.js');
var sw = new UVServiceWorker();
self.addEventListener('fetch', function (event) {
	return event.respondWith(sw.fetch(event));
});
