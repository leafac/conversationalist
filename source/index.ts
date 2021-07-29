import got from "got";
import { JSDOM } from "jsdom";

export default async (
  topic: string,
  { nGramSize = 2 }: { nGramSize?: number } = {}
) => {
  // const page = "Pet_door";
  // const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&formatversion=2`;
  // const response = (await got(url).json()) as any;
  // const text = response.parse.text;
  // const dom = JSDOM.fragment(`<div>${text}</div>`);
  // // console.log(dom.firstElementChild!.innerHTML);
  // // console.log(dom.firstElementChild!.textContent);
  // const corpus = dom.firstElementChild!.textContent!;
  // const tokens = corpus.split(/\W+/);
  // // console.log(tokens);
  //              0    1      2           length 3

  // const tokens = ["A", "dog", "exiting"];
  // const nGrams: { [tokens: string]: { [token: string]: number } } = {};
  // for (
  //   let currentTokenIndex = nGramSize;
  //   currentTokenIndex < tokens.length;
  //   currentTokenIndex++
  // ) {
  //   const key = tokens
  //     .slice(currentTokenIndex - nGramSize, currentTokenIndex)
  //     .join(" ");
  //   nGrams[key] ??= {};
  //   nGrams[key][tokens[currentTokenIndex]] =
  //     (nGrams[key][tokens[currentTokenIndex]] ?? 0) + 1;

  const nGrams = { "A dog": { exiting: 1, sleeps: 2 } };

  const model = Object.fromEntries(
    Object.entries(nGrams).map(([tokens, nextTokens]) => {
      const totalCount = Object.values(nextTokens).reduce(
        (totalCount, count) => totalCount + count,
        0
      );
      const weights = Object.fromEntries(
        Object.entries(nextTokens).map(([token, tokenCount]) => [
          token,
          tokenCount / totalCount,
        ])
      );
      let currentCutoff = 0;
      const cutoffs = Object.fromEntries(
        Object.entries(weights).map(([token, weight]) => {
          currentCutoff += weight;
          return [token, currentCutoff];
        })
      );
      return [tokens, cutoffs];
    })
  );

  console.log(model);

  //   tokens       nextTokens
  // { "A dog": { "exiting": 1, "sleeps": 2 } }
  // totalCount                                3
  // weights                 1/3          2/3
  //                         1/3          3/3
  //  cutoffs                  0.3333       1
  // Math.random()  -> 0 -- 1
  //                        0.1           0.5
  // Math.random() <= cutoff
};
