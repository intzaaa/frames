<script lang="ts">
	import 'core-js/stable';
	import 'regenerator-runtime/runtime';

	import { dev } from '$app/environment';
	navigator.serviceWorker.register('/service-worker.js', {
		type: dev ? 'module' : 'classic'
	});
</script>

<svelte:body lang="en-US" />

<svelte:head>
	<title>Frames</title>
</svelte:head>

<slot />
