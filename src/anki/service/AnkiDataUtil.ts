import AnkiApiService from "./AnkiApiService";
import {ANKI_COLORS} from "../../Constants";
import {truncDate} from "../../util/DateUtils";
import {AnkiReview} from "../models/AnkiReview";

export function createAnkiCardsDueQuery(deck: string, day: number) {
    return {
        "action": "findCards",
        "params": {
            "query": `deck:"${deck}" prop:due=${day}`
        }
    };
}

export type AnkiDeckSummary = {
    deckName: string,
    dueCards: number,
    newCards: number,
};

// TODO: Need to find a way to account for Custom Study adding new cards and other funky scenarios
async function fetchDeckSummary(deckName: string): Promise<AnkiDeckSummary> {
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

export async function fetchAnkiDeckSummaries(decks: string[]): Promise<AnkiDeckSummary[]> {
    const requests = [];
    for (const deck of decks) {
        requests.push(fetchDeckSummary(deck));
    }
    return await Promise.all(requests);
}

export type StageBreakDown = {
    type: string,
    color: string,
    count: number,
}

export async function fetchCardBreakDownData(decks: string[]): Promise<StageBreakDown[]> {
    const query = decks
        .map(deck => `deck:"${deck}"`)
        .join(" OR ")

    const newCards = await AnkiApiService.findCards(`(${query}) is:new`);
    const matureCards = await AnkiApiService.findCards(`(${query}) ("is:review" -"is:learn") AND "prop:ivl>=21"`);
    const youngCards = await AnkiApiService.findCards(`(${query}) ("is:review" AND -"is:learn") AND "prop:ivl<21"`);
    const learningCards = await AnkiApiService.findCards(`(${query}) (-"is:review" AND "is:learn")`);
    const relearningCards = await AnkiApiService.findCards(`(${query}) ("is:review" AND "is:learn")`);

    return [
        {type: 'New', color: ANKI_COLORS.blue, count: newCards.length},
        {type: 'Learning', color: ANKI_COLORS.lightOrange, count: learningCards.length},
        {type: 'Relearning', color: ANKI_COLORS.redOrange, count: relearningCards.length},
        {type: 'Young', color: ANKI_COLORS.lightGreen, count: youngCards.length},
        {type: 'Mature', color: ANKI_COLORS.darkGreen, count: matureCards.length},
    ];
}

export type UpcomingReviewDataPoint = {
    [deck: string]: number
} & {
    day: number
    date: Date,
    addDueCards: (deck: string, cards: any[]) => void
};

function upcomingReviewDataPoint(day: number): UpcomingReviewDataPoint {
    const data: any = {
        day,
        date: truncDate(Date.now() + (1000 * 60 * 60 * 24 * day)),
    };

    data.addDueCards = (deck: string, cards: any[]) => {
        data[deck] = cards.length;
    };

    return data;
}

export async function fetchAnkiUpcomingReviewData(decks: string[], numberOfDays: number): Promise<UpcomingReviewDataPoint[]> {
    const actions = [];
    for (let i = 0; i < numberOfDays; i++) {
        for (const deck of decks) {
            actions.push(createAnkiCardsDueQuery(deck, i));
        }
    }

    const listOfListDueCards = await AnkiApiService.sendMultiRequest(actions);

    const data = [upcomingReviewDataPoint(0)];
    for (let i = 0; i < listOfListDueCards.length; i++) {
        if (i % decks.length === 0 && i != 0) {
            data.push(upcomingReviewDataPoint(data[data.length - 1].day + 1));
        }
        const dp = data[data.length - 1];
        const deck = decks[i % decks.length];
        dp.addDueCards(deck, listOfListDueCards[i]);
    }
    return data;
}

export type DeckReviews = {
    deckName: string,
    reviews: AnkiReview[]
};

export async function fetchAnkiReviewsByDeck(deckNames: string[]): Promise<DeckReviews[]> {
    const reviewPromises: Promise<AnkiReview[]>[] = [];
    deckNames.forEach(name => reviewPromises.push(AnkiApiService.getAllReviewsByDeck(name)));
    const data = await Promise.all(reviewPromises);
    return data.map(((value, index) => ({
        deckName: deckNames[index],
        reviews: value
    })));
}


