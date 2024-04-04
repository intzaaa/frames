<script lang="ts">
	import 'large-small-dynamic-viewport-units-polyfill';
	import '../app.pcss';

	import { version } from '$app/environment';
	import { onMount } from 'svelte';
	import { Window, windowSize, URLList } from './store.js';
	let formHeight: number;
	let window: Window;
	$: rotate = 0;
	$: {
		if (localStorage.getItem('rotate')) {
			rotate = parseInt(localStorage.getItem('rotate') || '0') % 360;
		}
	}
	$: topOffset = 0;
	$: leftOffset = 0;
	$: {
		windowSpy(rotate);
	}
	$: {
		localStorage.setItem('rotate', rotate.toString());
	}

	function windowSpy(..._: any) {
		let height = globalThis.document.body.clientHeight;
		let width = globalThis.document.body.clientWidth;
		console.log(new Window(height, width));
		switch (rotate % 360) {
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
		new ResizeObserver(windowSpy).observe(globalThis.document.body);
	});

	import * as _ from 'remeda';
	$: currentFrameIndex = -1;
	$: {
		if (localStorage.getItem('currentFrameIndex')) {
			currentFrameIndex = parseInt(localStorage.getItem('currentFrameIndex') || '0');
		}
	}
	$: {
		localStorage.setItem('currentFrameIndex', currentFrameIndex.toString());
	}
	$: {
		if (currentFrameIndex > $URLList.length - 1) {
			currentFrameIndex = $URLList.length - 1;
		} else if (currentFrameIndex < -1) {
			currentFrameIndex = -1;
		}
	}
	function isKeyClick(event: Event): boolean {
		if (event instanceof PointerEvent) {
			if (event.pointerId === -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
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
	function clone(event: Event) {
		if (isKeyClick(event)) return;
		URLList.add($URLList[currentFrameIndex]);
	}
	function remove(event: Event) {
		if (isKeyClick(event)) return;
		URLList.remove(currentFrameIndex);
		currentFrameIndex = currentFrameIndex - 1;
	}
	$: load = 0;
	URLList.subscribe((i) => (load = i.length));
	function calculateLoad(load: number): number {
		if (Math.log(load + 1) * 50 < 255) {
			return Math.log(load + 1) * 50;
		} else return 255;
	}
</script>

<div
	class="main"
	style={`top: ${topOffset}px; left: ${leftOffset}px; transform: rotate(${rotate}deg); height: ${$windowSize.height + formHeight}px; width: ${$windowSize.width}px`}
>
	<form bind:clientHeight={formHeight} on:submit={add} class="header">
		<button
			on:click={(event) => {
				if (isKeyClick(event)) return;
				rotate = rotate - 90;
			}}
			><span style="transform: rotate(-45deg); display: inline-block; transform-origin: center"
				>R</span
			></button
		>
		<select
			bind:value={currentFrameIndex}
			disabled={$URLList.length === 0}
			style={`background-color:rgb(${calculateLoad(load)},0,0)`}
		>
			<option value="-1">HOME</option>
			{#each $URLList as url, index}
				<option value={index}>{index}: {new URL(url).hostname.toUpperCase()}</option>
			{/each}
		</select>
		<input
			name="url"
			type="url"
			placeholder={Number(currentFrameIndex) === -1
				? 'Start your surfing journey here...'
				: new URL($URLList[currentFrameIndex]).pathname}
		/>
		<button type="submit">New</button>
		<button on:click={clone} disabled={$URLList.length === 0 || Number(currentFrameIndex) === -1}
			>Clone</button
		>
		<button
			on:click={remove}
			disabled={$URLList.length === 0 || Number(currentFrameIndex) === -1}
			style="color: red">X</button
		>
	</form>
	<div class="window">
		{#each $URLList as url, index}
			<!-- svelte-ignore a11y-missing-attribute -->
			<iframe
				src={url}
				style={`top: ${formHeight}px ;height: ${$windowSize.height}px; left: ${index === currentFrameIndex ? '0' : '-100%'}; opacity: ${index === currentFrameIndex ? 1 : 0}; z-index: 99`}
			></iframe>
		{/each}
	</div>
	<div class="info">
		<div><b>Beyond the frames, naturally.</b></div>
		<div>Version: {version}</div>
		<div>{navigator.userAgent}</div>
		<div class="source">
			{#await (async () => {
				const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
				const text = await res.text();
				if (text.includes('loc=CN')) {
					throw new Error('YOU ARE USING CHINA INTERNET!');
				} else {
					return text;
				}
			})()}
				<span>...Checking Github Connection Availability</span>
			{:then _}
				<a href="https://github.com/intzaaa/frames/">Source Code</a>
			{:catch _}
				<span>Source Code: https://github.com/intzaaa/frames/</span>
			{/await}
		</div>
	</div>
</div>

<style lang="postcss">
	:global(*) {
		@apply box-border origin-top-left transition-all duration-300;
	}
	:global(body) {
		height: 100vh; /* For browsers that don't support CSS variables */
		height: calc(var(--1dvh, 1vh) * 100); /* This is the "polyfill" */
		height: 100dvh; /* This is for future browsers that support svh, dvh and lvh viewport units */
		background-image: url('/Iflytek_Suzhou_Branch_and_Institute.jpg');
		background-position: center;
		background-size: cover;
		@apply m-0 overflow-hidden p-0 transition-none;
	}
	.main {
		@apply absolute flex h-full w-full flex-col;
	}
	.header {
		@apply left-0 top-0 z-10 flex h-fit w-full flex-row bg-black font-mono text-white;
	}
	.header select {
		@apply w-fit min-w-12 max-w-48 bg-blue-800 outline-none disabled:hidden;
	}
	.header input {
		@apply grow border-0 bg-blue-950 pl-1 pr-1 outline-none;
	}
	.header button {
		@apply w-fit pl-2 pr-2 active:font-bold disabled:opacity-50;
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
		@apply absolute h-full w-full bg-gray-50 duration-700;
	}
	.info {
		@apply absolute bottom-0 z-0 p-8 font-mono text-xs text-white opacity-75;
	}
	.source {
		@apply underline;
	}
</style>
