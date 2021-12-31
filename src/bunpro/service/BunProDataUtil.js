export function createGrammarPointsLookupMap(grammarPoints) {
    let map = {};
    for (const grammarPoint of grammarPoints) {
        map[grammarPoint.id] = grammarPoint;
    }
    return map;
}