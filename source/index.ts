import got from "got";
import { JSDOM } from "jsdom";

export default async (topic: string, {}: {} = {}) => {
  const page = "Pet_door";
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&formatversion=2`;
  const response = (await got(url).json()) as any;
  const text = response.parse.text;
  const dom = JSDOM.fragment(`<div>${text}</div>`);

  // console.log(dom.firstElementChild!.innerHTML);
  // console.log(dom.firstElementChild!.textContent);
  
};
