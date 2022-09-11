import AnkiApiService from "./AnkiApiService";
import {ANKI_COLORS} from "../../Constants";
import {addDays, truncDate} from "../../util/DateUtils";
import {AnkiReview} from "../models/AnkiReview";
import {AnkiCard} from "../models/AnkiCard";

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

function createCardTimestampMap(cards: AnkiCard[]) {
    const map: { [key: number]: AnkiCard[] } = {};
    for (const card of cards) {
        const date = truncDate(card.note).getTime();
        if (!!map[date]) {
            map[date].push(card);
        } else {
            map[date] = [card];
        }
    }
    return map;
}

function createReviewTimestampMap(reviews: AnkiReview[]) {
    const map: { [key: number]: AnkiReview[] } = {};
    for (const review of reviews) {
        const date = truncDate(review.reviewTime).getTime();
        if (!!map[date]) {
            map[date].push(review);
        } else {
            map[date] = [review];
        }
    }
    return map;
}

export type AnkiBreakDownHistoryDataPoint = {
    date: number,
    newCount: number,
    learningCount: number,
    relearningCount: number,
    youngCount: number,
    matureCount: number,
};

export async function fetchBreakDownHistoryData(decks: string[]) {
    // Fetch all the cards
    const cardIdPromises = decks.map(deck => AnkiApiService.getAllCardIdsByDeck(deck));
    const cardIdResults = await Promise.all(cardIdPromises);
    const cardIds = cardIdResults.flat();
    const cards = await AnkiApiService.getCardInfo(Array.from(new Set(cardIds)));

    // Fetch all the reviews
    const reviewPromises = decks.map(deck => AnkiApiService.getAllReviewsByDeck(deck));
    const reviewResults = await Promise.all(reviewPromises);
    const reviews = reviewResults.flat().sort((a, b) => a.reviewTime - b.reviewTime);

    const reviewsMap = createReviewTimestampMap(reviews);

    const firstDay = truncDate(reviews[0].reviewTime).getTime();
    const lastDay = Date.now();

    const tsMap = createCardTimestampMap(cards);

    const statusMap: { [cardId: number]: { newInterval: number, reviewType: number } } = {};

    // Add any cards that were created before the first review day
    Object.entries(tsMap)
        .filter(([key]) => parseInt(key) < firstDay)
        .forEach(([, value]) => {
            for (const card of (value as AnkiCard[])) {
                statusMap[card.cardId] = {
                    newInterval: 0,
                    reviewType: 0,
                };
            }
        })


    const data: AnkiBreakDownHistoryDataPoint[] = [];

    function snapshot() {
        let newCount = 0;
        let youngCount = 0;
        let matureCount = 0
        let learningCount = 0;
        let relearningCount = 0;


        for (const value of Object.values(statusMap)) {
            if (value.newInterval >= 21) {
                matureCount += 1;
                continue;
            }
            if (value.newInterval > 0) {
                youngCount += 1;
                continue;
            }
            if (value.newInterval == 0) {
                newCount += 1;
                continue;
            }
            if (value.reviewType == 2) {
                relearningCount += 1;
            } else {
                learningCount += 1;
            }
        }
        return {
            newCount,
            learningCount,
            relearningCount,
            youngCount,
            matureCount
        };
    }

    let currentDay = firstDay;
    while (currentDay <= lastDay) {

        // Add any newly created cards to the status map
        const cardsCreatedOnCurrentDay = tsMap[currentDay];
        if (cardsCreatedOnCurrentDay) {
            for (const card of cardsCreatedOnCurrentDay) {
                statusMap[card.cardId] = {
                    newInterval: 0,
                    reviewType: 0,
                };
            }
        }

        // Update the card interval for any cards reviewed on current day
        const reviewsOnCurrentDay = reviewsMap[currentDay];
        if (reviewsOnCurrentDay) {
            for (const review of reviewsOnCurrentDay) {
                statusMap[review.cardId] = {
                    newInterval: review.newInterval,
                    reviewType: review.reviewType,
                };
            }
        }

        // Take a snapshot of the card counts on current day
        data.push({
            date: currentDay,
            ...snapshot()
        })

        // Advance to the next day
        currentDay = addDays(currentDay, 1).getTime();
    }

    return data;
}




