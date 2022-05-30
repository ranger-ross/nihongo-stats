import kanji from "kanji";

function createKanjiFrequencyLookupMap() {
    let map = {};
    for (const [index, value] of kanji.freq.entries()) {
        map[value] = index + 1;
    }
    return map;
}

function createKanjiJLPTLookupMap() {
    let map = {};
    for (const value of kanji.jlpt.n5) {
        map[value] = 'N5';
    }
    for (const value of kanji.jlpt.n4) {
        map[value] = 'N4';
    }
    for (const value of kanji.jlpt.n3) {
        map[value] = 'N3';
    }
    for (const value of kanji.jlpt.n2) {
        map[value] = 'N2';
    }
    for (const value of kanji.jlpt.n1) {
        map[value] = 'N1';
    }
    return map;
}

export const kanjiJLPTLookupMap = createKanjiJLPTLookupMap();
export const kanjiFrequencyLookupMap = createKanjiFrequencyLookupMap();
