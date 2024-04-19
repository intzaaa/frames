import { get, writable, type Updater } from 'svelte/store';
import { sha1 } from 'js-sha1';
import mitt from 'mitt';
type Events = {
	[id: string]: URL | undefined;
};
export const targetURLEmitter = mitt<Events>();

export class DisplayArea {
	constructor(height: number, width: number) {
		this.height = height;
		this.width = width;
	}
	public height: number;
	public width: number;
	static Zero(): DisplayArea {
		return new DisplayArea(0, 0);
	}
}

export const displayAreaSize = writable(DisplayArea.Zero());

const proxyPrefix = '/proxy/service/';

const xor = {
	encode(str: string) {
		if (!str) return str;
		return encodeURIComponent(
			str
				.toString()
				.split('')
				.map((char: string, ind: number) =>
					ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char
				)
				.join('')
		);
	},
	decode(str: string) {
		if (!str) return str;
		let [input, ...search] = str.split('?');

		return (
			decodeURIComponent(input)
				.split('')
				.map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char))
				.join('') + (search.length ? '?' + search.join('?') : '')
		);
	}
};

function encodeTargetURLToProxyURL(url: URL): URL {
	return new URL(proxyPrefix + xor.encode(url.href), globalThis.location.href);
}

function decodeTargetURLFromProxyURL(url: URL): URL {
	return new URL(xor.decode(url.pathname.slice(proxyPrefix.length)));
}

type FrameMode = 'direct' | 'proxy';

export class Frame {
	constructor(src: URL, mode: FrameMode, url?: URL, id?: string) {
		this.mode = mode;
		this.src = url ?? src;
		this._url = url ?? src;
		this.id = id || sha1(Math.random().toString()).substr(0, 5);
		if (mode === 'proxy') {
			targetURLEmitter.emit(this.id, this.targetURL);
			setInterval(() => {
				this.syncProxyUrl();
			}, 50);
		}
	}

	public static Direct(src: URL): Frame {
		return new Frame(src, 'direct');
	}

	public static Proxy(targetURL: URL): Frame {
		return new Frame(encodeTargetURLToProxyURL(targetURL), 'proxy');
	}

	public static fromObject(obj: any): Frame {
		return new Frame(new URL(obj.src), obj.mode, new URL(obj._url), obj.id);
	}
	public readonly src;
	private lock = false;
	protected _url;
	public get url(): URL {
		switch (this.mode) {
			case 'direct':
				return this.src;
			case 'proxy':
				return this._url;
		}
	}
	public set url(value) {
		this._url = value;
	}
	public get targetURL(): URL | undefined {
		switch (this.mode) {
			case 'direct':
				return undefined;
			case 'proxy':
				try {
					return decodeTargetURLFromProxyURL(this.url);
				} catch (error) {
					return undefined;
				}
		}
	}
	public set targetURL(value: URL) {
		this.url = encodeTargetURLToProxyURL(value);
		if (this.element && this.mode === 'proxy') {
			this.lock = true;
			this.element.contentWindow!.location.href = this.url.href;
			console.log('Locked', this.url.href);
		}
	}
	private syncProxyUrl(): void {
		if (this.element) {
			try {
				const contentWindow = this.element.contentWindow!;
				if (contentWindow.location.href === this.url.href && this.lock) {
					this.lock = false;
					targetURLEmitter.emit(this.id, this.targetURL);
					console.log('Unlocked', this.url.href);
				}
				if (contentWindow.location.href !== this.url.href && !this.lock) {
					this.url = new URL(this.element.contentWindow!.location.href);
					targetURLEmitter.emit(this.id, this.targetURL);
					console.log('Changed', this.url.href);
				}
			} catch (error) {
				// console.log(error);
				return;
			}
		} else {
			// console.log('Could not find element');
			return;
		}
	}
	public readonly id;
	public readonly mode;
	public element?: HTMLIFrameElement;
}

function createFrameList() {
	let URLList: Array<Frame>;
	if (localStorage.getItem('FrameList') !== null) {
		URLList = (JSON.parse(localStorage.getItem('FrameList')!) as Array<any>).map((i) => {
			return Frame.fromObject(i);
		}) as Array<Frame>;
	} else {
		URLList = new Array<Frame>();
	}

	const { subscribe, set, update } = writable(URLList);

	const sortUpdate = (func: Updater<Frame[]>) =>
		update(
			(n) => func(n)
			// func(n).toSorted((a, b) => {
			// 	const ah = a.url.hostname.toLowerCase();
			// 	const bh = b.url.hostname.toLowerCase();
			// 	return ah.localeCompare(bh, 'en');
			// })
		);

	return {
		subscribe,
		set,
		add: (frame: Frame) =>
			sortUpdate((n) => {
				n.push(frame);
				return n;
			}),
		remove: (index: number) =>
			sortUpdate((n) => {
				return n.toSpliced(index, 1);
			}),
		clear: () => set(new Array<Frame>())
	};
}

export const FrameList = createFrameList();

function tryStoreFrameList(v: Array<Frame>) {
	try {
		v.forEach((i) => {
			if (i.mode === 'proxy' && i.targetURL?.hostname == undefined) {
				throw new Error('Invalid URL');
			}
		});
		localStorage.setItem('FrameList', JSON.stringify(v));
	} catch (error) {}
}

FrameList.subscribe((i) => {
	tryStoreFrameList(i);
});

targetURLEmitter.on('*', () => tryStoreFrameList(get(FrameList) as Array<Frame>));
