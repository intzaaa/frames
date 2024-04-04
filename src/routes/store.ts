import { writable } from 'svelte/store';

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

import * as _ from "remeda";

function createURLList() {
  let URLList: Array<string>;
  if (localStorage.getItem("URLList") !== null) {
    URLList = _.clone(JSON.parse(localStorage.getItem("URLList")!));
  } else {
    URLList = new Array<string>()
  }

  const { subscribe, set, update } = writable(URLList);

  return {
    subscribe,
    add: (url: string) => update((n) => {
      let newList: Array<string> = Array.from(n);
      newList.push(new URL(url).href);
      return newList;
    }),
    remove: (index: number) => update((n) => {
      return n.toSpliced(index, 1);
    }),
    clear: () => set(new Array<string>())
  };
}

export const URLList = createURLList();

URLList.subscribe((i) => {
  localStorage.setItem("URLList", JSON.stringify(i));
})