'use strict';
/**
 * Distributed with Ultraviolet and compatible with most configurations.
 */
const stockSW = '/proxy/sw.js';

/**
 * List of hostnames that are allowed to run serviceworkers on http://
 */
const swAllowedHostnames = ['localhost', '127.0.0.1'];

/**
 * Global util
 * Used in 404.html and index.html
 */
async function registerSW() {
	if (!navigator.serviceWorker) {
		if (location.protocol !== 'https:' && !swAllowedHostnames.includes(location.hostname))
			throw new Error('Service workers cannot be registered without https.');

		throw new Error("Your browser doesn't support proxy workers.");
	}

	await navigator.serviceWorker.register(stockSW, {
		scope: __uv$config.prefix
	});

	// // Register the EpoxyClient transport to be used for network requests
	// let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	// BareMux.SetTransport("EpxMod.EpoxyClient", { wisp: wispUrl });
}

registerSW();
