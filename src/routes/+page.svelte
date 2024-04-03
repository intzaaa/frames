<script lang="ts">
	import 'large-small-dynamic-viewport-units-polyfill';
	import '../app.pcss';

	import { onMount } from 'svelte';
	import { Window, windowSize, URLList } from './store.js';
	let formHeight: number;
	let window: Window;
	let main: Element;
	$: rotate = 0;
	$: topOffset = 0;
	$: leftOffset = 0;
	$: {
		if (rotate < -270) rotate = 0;
		windowSpy();
	}

	function windowSpy() {
		let height = globalThis.document.body.clientHeight;
		let width = globalThis.document.body.clientWidth;
		console.log(new Window(height, width));
		switch (rotate) {
			case 0:
				topOffset = 0;
				leftOffset = 0;
				window = new Window(height - formHeight, width);
				break;
			case -180:
				topOffset = height;
				leftOffset = width;
				window = new Window(height - formHeight, width);
				break;
			case -90:
				topOffset = height;
				leftOffset = 0;
				window = new Window(width - formHeight, height);
				break;
			case -270:
				topOffset = 0;
				leftOffset = width;
				window = new Window(width - formHeight, height);
				break;
		}
		console.log(rotate);
		windowSize.set(window);
		console.log(window);
	}

	onMount(() => {
		new ResizeObserver(windowSpy).observe(main);
	});

	import * as _ from 'remeda';
	$: currentFrameIndex = 0;
	$: {
		if (currentFrameIndex > $URLList.length - 1) {
			currentFrameIndex = $URLList.length - 1;
		} else if (currentFrameIndex < 0) {
			currentFrameIndex = 0;
		}
	}
	function add(event: Event) {
		event.preventDefault();
		if (event.target instanceof HTMLFormElement) {
			let formElement: HTMLFormElement = event.target;
			let formData = new FormData(formElement);
			let url = formData.get('url')?.toString();
			if (url) {
				URLList.add(url);
				currentFrameIndex = $URLList.length - 1;
			}
			event.target.url.value = '';
		}
	}
	function remove() {
		URLList.remove(currentFrameIndex);
		currentFrameIndex = currentFrameIndex - 1;
	}
</script>

<div
	bind:this={main}
	class="main"
	style={`top: ${topOffset}px; left: ${leftOffset}px; transform: rotate(${rotate}deg); height: ${$windowSize.height}px; width: ${$windowSize.width}px`}
>
	<form bind:clientHeight={formHeight} on:submit={add} class="header">
		<button
			on:click={() => {
				rotate = rotate - 90;
			}}>Rotate!</button
		>
		<select bind:value={currentFrameIndex} disabled={$URLList.length === 0}>
			{#each $URLList as url, index}
				<option value={index}>{index}:{new URL(url).hostname.toUpperCase()}({url})</option>
			{/each}
		</select>
		<input name="url" type="url" />
		<button type="submit">Add</button>
		<button on:dblclick={remove} disabled={$URLList.length === 0}>Remove</button>
	</form>
	<div class="window">
		{#each $URLList as url, index}
			<!-- svelte-ignore a11y-missing-attribute -->
			<iframe
				src={url}
				style={`height: ${$windowSize.height}px;left: ${index === currentFrameIndex ? '0' : '-100%'}`}
			></iframe>
		{/each}
	</div>
</div>

<style lang="postcss">
	:global(*) {
		@apply box-border origin-top-left;
	}
	:global(body) {
		height: 100vh; /* For browsers that don't support CSS variables */
		height: calc(var(--1dvh, 1vh) * 100); /* This is the "polyfill" */
		height: 100dvh; /* This is for future browsers that support svh, dvh and lvh viewport units */
		@apply m-0  p-0;
	}
	.main {
		@apply absolute flex h-full w-full flex-col;
	}
	.header {
		@apply left-0 top-0 flex h-fit w-full flex-row bg-black font-mono text-white;
	}
	.header select {
		@apply w-36 bg-blue-800 outline-none;
	}
	.header input {
		@apply grow border-0 bg-blue-950 outline-none;
	}
	.header button {
		@apply w-fit pl-2 pr-2;
	}
	.header > * {
		border-left-width: 1.125px !important;
		border-right-width: 1.125px !important;
		@apply border-solid border-blue-600;
	}
	.window {
		@apply h-full w-full grow;
	}
	.window iframe {
		@apply absolute h-full w-full;
	}
</style>
