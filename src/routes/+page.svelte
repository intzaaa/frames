<script lang="ts">
	import 'large-small-dynamic-viewport-units-polyfill';
	import logo from '$lib/iflytek.svg';
	import '../app.pcss';
	import { version } from '$app/environment';
	import { onMount } from 'svelte';
	import * as _ from 'remeda';
	import { sha1 } from 'js-sha1';
	import { Frame, FrameList, s, targetURLEmitter } from './utilities.js';

	let deviceId: string;
	if (localStorage.getItem('id')) {
		deviceId = localStorage.getItem('id')!;
	} else {
		deviceId = sha1(Date.now().toString()).substr(0, 5).toUpperCase();
		localStorage.setItem('id', deviceId);
	}

	$: isAtHome = false;
	$: {
		isAtHome = currentFrameId === deviceId;
		console.log([deviceId, currentFrameId, isAtHome]);
	}
	let formHeight: number;
	$: load = 0;
	$: {
		load = $FrameList.length;
	}
	function calculateLoad(load: number): number {
		if (Math.log(load + 1) * 50 < 255) {
			return Math.log(load + 1) * 50;
		} else return 255;
	}
	let form: HTMLFormElement;
	let input: HTMLInputElement;
	$: currentFrameId = deviceId;
	$: {
		if (localStorage.getItem('currentFrameId')) {
			currentFrameId = localStorage.getItem('currentFrameId') ?? deviceId;
		}
	}
	$: {
		localStorage.setItem('currentFrameId', currentFrameId);
	}
	$: currentFrame = $FrameList.find((i) => i.id === currentFrameId);
	$: {
		if (currentFrameId) targetURLEmitter.emit(currentFrameId, currentFrame?.targetURL);
	}

	targetURLEmitter.on('*', (id, targetURL) => {
		if (currentFrameId === id && input) {
			input.value = targetURL?.href ?? '';
			console.log('TargetEvent', id, targetURL?.href!);
		}
	});

	$: isProxyMode = false;
	$: {
		if (currentFrame?.mode === 'proxy') {
			isProxyMode = true;
		}
	}

	onMount(() => {
		const url = new URL(globalThis.window.location.href);
		if (url.searchParams.has('restore')) {
			localStorage.clear();
			url.searchParams.delete('restore');
			globalThis.window.location.replace(url);
		}
		setInterval(() => globalThis.window.scrollTo(0, 0), 25);
	});

	function autoCompleteURLProtocol(url: string | undefined): URL {
		const fallbackURL = new URL('https://www.iflytek.com');
		if (!url) {
			return fallbackURL;
		} else {
			try {
				return new URL(url);
			} catch (error) {
				try {
					return new URL(`https://${url}`);
				} catch (error) {
					return fallbackURL;
				}
			}
		}
	}

	function add(event: Event) {
		form.blur();
		const url = autoCompleteURLProtocol(form.input.value);
		let frame: Frame;
		switch (isProxyMode) {
			case false:
				frame = Frame.Direct(url);
				FrameList.add(frame);
				break;
			case true:
				frame = Frame.Proxy(url);
				FrameList.add(frame);
				break;
		}
		currentFrameId = frame.id;
		input.value = '';
	}
	function adjust(event: Event) {
		currentFrame!.targetURL = autoCompleteURLProtocol(input.value);
		input.value = '';
	}
	function clone(event: Event) {
		switch (currentFrame?.mode) {
			case 'direct':
				FrameList.add(Frame.Direct(currentFrame.src));
				break;
			case 'proxy':
				FrameList.add(Frame.Proxy(currentFrame.targetURL!));
				break;
		}
	}
	function remove(event: Event) {
		const index = $FrameList.findIndex((i) => i.id === currentFrameId);
		FrameList.remove(index);
		if (index - 1 >= 0) {
			currentFrameId = $FrameList[index - 1].id;
		} else {
			currentFrameId = deviceId;
		}
	}

	$: zoom = 1;
</script>

<div id="main" class="main">
	<div class="window">
		{#each $FrameList as frame (frame.id)}
			<!-- svelte-ignore a11y-missing-attribute -->
			<iframe
				bind:this={frame.element}
				class:pointer-none={frame.id !== currentFrameId}
				src={frame.src.href}
				style={s({
					transform: `translateY(calc(${($FrameList.findIndex((i) => i.id === currentFrameId) + $FrameList.findIndex((i) => i.id === frame.id)) * 100}%)) scale(${zoom})`,
					width: `${100 / zoom}%`,
					height: `${100 / zoom}%`,
					zIndex: 49
				})}
			></iframe>
		{/each}
	</div>

	<form
		id="form"
		bind:this={form}
		bind:clientHeight={formHeight}
		on:submit|preventDefault={isProxyMode && currentFrame?.mode === 'proxy' ? adjust : add}
		class="header"
	>
		<button
			type="button"
			disabled={isAtHome}
			on:click={() => {
				if (zoom < 3) zoom = zoom + 0.1;
			}}
		>
			+
		</button>
		<button
			type="button"
			disabled={isAtHome}
			on:click={() => {
				if (zoom > 0.2) zoom = zoom - 0.1;
			}}
		>
			-
		</button>
		<button
			type="button"
			disabled={zoom === 1 || isAtHome}
			on:click={() => {
				zoom = 1;
			}}
		>
			Z
		</button>

		<select
			bind:value={currentFrameId}
			disabled={$FrameList.length === 0}
			style={`background-color:rgb(${calculateLoad(load)},0,0); appearance: none`}
		>
			<option value={deviceId}>{deviceId} HOME</option>
			{#each $FrameList as frame}
				<option value={frame.id}>
					{frame.id.toUpperCase()}
					{#key currentFrame?.targetURL?.href}
						{(frame.mode === 'proxy' ? frame.targetURL : frame.url)?.hostname?.toUpperCase()}
					{/key}
				</option>
			{/each}
		</select>
		<input
			bind:this={input}
			autocomplete=""
			name="input"
			type="text"
			placeholder={isAtHome
				? 'You are standing in an open field west of a white house, with a boarded front door...'
				: currentFrame?.url.pathname}
		/>

		<button
			type="button"
			on:click={() => {
				currentFrame?.element?.contentWindow?.history.back();
			}}
			disabled={currentFrame?.mode !== 'proxy' || isAtHome}>B</button
		>
		<button
			type="button"
			on:click={() => {
				currentFrame?.element?.contentWindow?.history.forward();
			}}
			disabled={currentFrame?.mode !== 'proxy' || isAtHome}>F</button
		>
		<button
			type="button"
			on:click={() => {
				currentFrame?.element?.contentWindow?.location.reload();
			}}
			disabled={currentFrame?.mode !== 'proxy' || isAtHome}>R</button
		>
		<button
			type="button"
			on:click={(event) => {
				isProxyMode = !isProxyMode;
			}}
			class:switch-on={isProxyMode}>{isProxyMode ? 'P' : 'D'}</button
		>
		<button type="submit">A</button>
		<button type="button" on:click={clone} disabled={$FrameList.length === 0 || isAtHome}>C</button>
		<button
			type="button"
			on:click={remove}
			disabled={$FrameList.length === 0 || isAtHome}
			style="color: red">X</button
		>
	</form>

	<div
		class="info"
		style={s({
			display: !isAtHome ? 'none' : 'block'
		})}
	>
		<h1 class="title">Beyond the frames, naturally.</h1>
		<details class="info-verbose">
			<summary>Verbose</summary>
			<div>Version: {version}</div>
			<div>User-Agent: {navigator.userAgent}</div>
			<div class="source">
				Source Code: <u>https://github.com/intzaaa/frames</u>
			</div>
		</details>
	</div>
</div>

<style lang="postcss">
	.main {
		@apply flex h-full w-full flex-col overflow-hidden;
	}
	.header {
		@apply left-0 top-0 z-50 flex h-fit w-full max-w-full flex-row bg-black font-mono text-white transition-none;
	}
	.header select {
		box-sizing: content-box;
		@apply w-[5ch]  bg-blue-800 outline-none disabled:opacity-50;
	}
	.header input {
		@apply w-auto min-w-4 grow text-ellipsis border-0 bg-blue-950 outline-none;
	}
	.header button {
		@apply w-fit active:font-bold disabled:opacity-50;
	}
	.header > * {
		border-left-width: 1.125px !important;
		border-right-width: 1.125px !important;
		@apply appearance-none border-solid border-blue-600 pl-2 pr-2;
	}
	.window {
		@apply h-full w-full grow overflow-hidden;
	}
	.window iframe {
		@apply h-full w-full bg-gray-50 duration-700;
	}
	.info {
		@apply absolute top-0 z-0 w-4/5 p-8 font-mono  text-white opacity-75 hover:opacity-100;
	}
	.info * {
		@apply text-xs;
	}
	.pointer-none {
		@apply pointer-events-none;
	}
	.switch-on {
		@apply bg-green-500;
	}
</style>
