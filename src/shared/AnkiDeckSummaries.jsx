import {ankiColors} from "../Constants.js";
import AnkiApiService from "../anki/service/AnkiApiService.js";

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


function AnkiDeckSummaries({deckData}) {
    return deckData.map(data => (
        <div key={data.deckName}>
            <strong>{data.deckName}</strong>
            <p>
                <strong>
                    <span>Reviews: <span style={{color: ankiColors.lightGreen}}>{data.dueCards}</span></span>
                    <span style={{marginLeft: '15px'}}>New: <span
                        style={{color: ankiColors.blue}}>{data.newCards}</span></span>
                </strong>
            </p>
        </div>
    ));
}

export default AnkiDeckSummaries;