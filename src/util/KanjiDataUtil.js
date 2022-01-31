import kanji from "kanji";

function createKanjiFrequencyLookupMap() {
    let map = {};
    for (const [index, value] of kanji.freq.entries()) {
        map[value] = index + 1;
    }
    return map;
}

export const kanjiFrequencyLookupMap = createKanjiFrequencyLookupMap();