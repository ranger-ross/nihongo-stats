export function createAnkiCardsDueQuery(deck, day) {
    return {
        "action": "findCards",
        "params": {
            "query": `deck:"${deck}" prop:due=${day}`
        }
    };
}