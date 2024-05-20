<script lang="ts">
	import { dev } from '$app/environment';
	navigator.serviceWorker.register('/service-worker.js', {
		scope: '/',
		type: dev ? 'module' : 'classic'
	});
</script>

<svelte:body
	lang="en-US"
	on:click={(event) => {
		if (event.target instanceof HTMLBodyElement) {
			globalThis.window.scrollTo(0, 0);
		}
	}}
/>

<svelte:head>
	<title>Frames</title>
</svelte:head>

<slot />

<style lang="postcss">
	:global(*) {
		@apply box-border origin-top-left transform-gpu transition-all duration-300;
	}
	:global(html) {
		@apply overflow-hidden;
	}
	:global(body) {
		height: 100vh; /* For browsers that don't support CSS variables */
		height: calc(var(--1dvh, 1vh) * 100); /* This is the "polyfill" */
		height: 100dvh; /* This is for future browsers that support svh, dvh and lvh viewport units */

		background-image: url('/MORETOWN_FOCUS.webp');
		background-position: center;
		background-size: cover;

		@apply m-0 w-full overflow-hidden p-0 transition-none;
	}
</style>
