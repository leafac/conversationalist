import got from "got";
import { JSDOM } from "jsdom";

export default async (
  topic: string,
  { nGramSize = 2 }: { nGramSize?: number } = {}
) => {
  // Scraping
  const page = "Pet_door";
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&formatversion=2`;
  const response = (await got(url).json()) as any;
  const text = response.parse.text;
  const dom = JSDOM.fragment(`<div>${text}</div>`);
  const corpus = dom.firstElementChild!.textContent!;

  // Tokenization
  const tokens = corpus.split(/\W+/);

  // nGrams count
  const nGrams: { [tokens: string]: { [token: string]: number } } = {};
  for (
    let currentTokenIndex = nGramSize;
    currentTokenIndex < tokens.length;
    currentTokenIndex++
  ) {
    const key = tokens
      .slice(currentTokenIndex - nGramSize, currentTokenIndex)
      .join(" ");
    nGrams[key] ??= {};
    nGrams[key][tokens[currentTokenIndex]] =
      (nGrams[key][tokens[currentTokenIndex]] ?? 0) + 1;
  }

  // Build model
  const model: { [tokens: string]: { [nextToken: string]: number } } =
    Object.fromEntries(
      Object.entries(nGrams).map(([tokens, nextTokens]) => {
        const totalCount = Object.values(nextTokens).reduce(
          (totalCount, count) => totalCount + count,
          0
        );
        let currentCutoff = 0;
        const cutoffs = Object.fromEntries(
          Object.entries(nextTokens).map(([token, tokenCount]) => {
            const weight = tokenCount / totalCount;
            currentCutoff += weight;
            return [token, currentCutoff];
          })
        );
        return [tokens, cutoffs];
      })
    );

  const startTokenIndex = Math.floor(Math.random() * tokens.length);
  const sentenceTokens: string[] = tokens.slice(
    startTokenIndex,
    startTokenIndex + nGramSize
  );
  for (const _ of new Array(6)) {
    const currentTokens = sentenceTokens.slice(-nGramSize).join(" ");
    const nextTokens = model[currentTokens];
    if (nextTokens === undefined) break;
    const x = Math.random();
    const nextToken = Object.entries(nextTokens).find(
      ([nextToken, cutoff]) => x <= cutoff
    )![0];
    sentenceTokens.push(nextToken);
  }
  const sentence = `${sentenceTokens.join(" ")}.`;

  console.log(sentence);
};
