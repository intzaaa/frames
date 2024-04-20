<script lang="ts">
	import { dev } from '$app/environment';
	navigator.serviceWorker.register('/sw.js', {
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
