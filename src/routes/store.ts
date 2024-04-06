import { derived, writable } from 'svelte/store';

class Window {
	constructor(height: number, width: number) {
		this.height = height;
		this.width = width;
	}
	public height: number;
	public width: number;
	static Zero(): Window {
		return new Window(0, 0);
	}
}

export { Window };
export const windowSize = writable(Window.Zero());

import { sha1 } from 'js-sha1';

class UniqueURL {
	constructor(url: URL) {
		this.url = url;
		this.id = sha1(Date.now() + this.url.href).substr(0, 5);
	}
	public url;
	public id;
}

export { UniqueURL };

import * as _ from 'remeda';

function createURLList() {
	let URLList: Array<UniqueURL>;
	if (localStorage.getItem('UniqueURLList') !== null) {
		URLList = (_.clone(JSON.parse(localStorage.getItem('UniqueURLList')!)) as Array<any>).map(
			(i) => {
				i.url = new URL(i.url);
				return i;
			}
		) as Array<UniqueURL>;
	} else {
		URLList = new Array<UniqueURL>();
	}

	const { subscribe, set, update } = writable(URLList);

	return {
		subscribe,
		add: (url: URL) =>
			update((n) => {
				let newList: Array<UniqueURL> = Array.from(n);
				newList.push(new UniqueURL(url));
				return newList;
			}),
		remove: (index: number) =>
			update((n) => {
				return n.toSpliced(index, 1);
			}),
		clear: () => set(new Array<UniqueURL>())
	};
}

export const URLList = createURLList();

URLList.subscribe((i) => {
	localStorage.setItem('UniqueURLList', JSON.stringify(i));
});

export const sortedURLList = derived(URLList, (i) => {
	return i.toSorted((a, b) => {
		const ah = a.url.hostname.toLowerCase();
		const bh = b.url.hostname.toLowerCase();
		return ah.localeCompare(bh, 'en');
	});
});
