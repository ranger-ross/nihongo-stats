import AnkiApiService from "./AnkiApiService.ts";

export function createAnkiCardsDueQuery(deck, day) {
    return {
        "action": "findCards",
        "params": {
            "query": `deck:"${deck}" prop:due=${day}`
        }
    };
}

// TODO: Need to find a way to account for Custom Study adding new cards and other funky scenarios
async function fetchDeckSummary(deckName) {
    const dueCards = await AnkiApiService.findCards(`"deck:${deckName}" prop:due=0`);
    const newCards = await AnkiApiService.findCards(`"deck:${deckName}" is:new`);
    let newCardsToReview = 0;
    if (newCards.length > 0) { // Check if there are still new cards left in the deck
        const newCardsAlreadyReviewed = await AnkiApiService.findCards(`"deck:${deckName}" introduced:1`);
        const deckConfig = await AnkiApiService.getDeckConfig(deckName);
        const cardsPerDay = deckConfig.new.perDay;

        // Check if user has already reviewed new cards
        if (cardsPerDay > 0 && cardsPerDay > newCardsAlreadyReviewed.length) {
            const newCardsToReviewToday = cardsPerDay - newCardsAlreadyReviewed.length;
            newCardsToReview = newCardsToReviewToday > newCards.length ? newCards.length : newCardsToReviewToday;
        }
    }
    return {
        deckName: deckName,
        dueCards: dueCards.length,
        newCards: newCardsToReview,
    };
}

export async function fetchAnkiDeckSummaries(decks) {
    let requests = [];
    for (const deck of decks) {
        requests.push(fetchDeckSummary(deck));
    }
    return await Promise.all(requests);
}
