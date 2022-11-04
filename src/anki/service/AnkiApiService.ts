import * as localForage from "localforage"
import {APP_URLS} from "../../Constants";
import {AnkiDeck} from "../models/AnkiDeck";
import {AnkiReview} from "../models/AnkiReview";
import {AnkiCard} from "../models/AnkiCard";

const ankiConnectApiUrl = APP_URLS.ankiApi;

const cacheKeys = {
    decks: 'anki-deck-names-and-ids',
    cardInfo: 'anki-card-info',
    reviewsPrefix: 'anki-reviews-'
}

function invoke(action: string, version: number, params = {}) {
    return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                // eslint-disable-next-line no-prototype-builtins
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                // eslint-disable-next-line no-prototype-builtins
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', ankiConnectApiUrl);
        xhr.send(JSON.stringify({action, version, params}));
    });
}


function convertDeckMapToArray(decks: { [name: string]: number }) {
    const arr = [];
    for (const name of Object.keys(decks)) {
        const id = decks[name];
        arr.push({
            id,
            name
        });
    }
    return arr;
}

function createCardReviewFromTuple(tuple: number[]): AnkiReview {
    return {
        reviewTime: tuple[0],
        cardId: tuple[1],
        usn: tuple[2],
        buttonPressed: tuple[3],
        newInterval: tuple[4],
        previousInterval: tuple[5],
        newFactor: tuple[6],
        reviewDuration: tuple[7],
        reviewType: tuple[8]
    };
}

function connect() {
    return fetch(ankiConnectApiUrl)
        .then(response => {
            if (response.status === 200) {
                return true;
            } else {
                throw new Error("Anki Connect NonSuccess: " + response.status);
            }
        });
}

function getCardReviews(deckName: string, startTimestamp = new Date(2000, 0, 1).getTime()): Promise<AnkiReview[]> {
    return invoke("cardReviews", 6, {
        "deck": deckName,
        "startID": startTimestamp
    }).then((data: number[][]) => data.map(createCardReviewFromTuple));
}

async function getAllReviewsByDeck(deckName: string): Promise<AnkiReview[]> {
    let reviews = await getCardReviews(deckName);
    reviews = reviews.sort((a: any, b: any) => a.reviewTime - b.reviewTime);
    return reviews;
}

async function getDeckNamesAndIdsWithoutCache(): Promise<AnkiDeck[]> {
    let data = await invoke("deckNamesAndIds", 6).then(convertDeckMapToArray);
    data = data.filter(deck => deck.name.toLowerCase() !== 'default')
    return data;
}

async function getDeckNamesAndIds(): Promise<AnkiDeck[]> {
    return getDeckNamesAndIdsWithoutCache();
}

async function getDeckNames() {
    const data = await getDeckNamesAndIds();
    return data.map((deck: AnkiDeck) => deck.name);
}

// See Docs: https://docs.ankiweb.net/searching.html
function findCards(query: string) {
    return invoke("findCards", 6, {"query": query})
}

function requestPermission() {
    return invoke("requestPermission", 6);
}

async function flushCache() {

    await localForage.iterate(async function (value, key) {
        if (key.indexOf(cacheKeys.reviewsPrefix) > -1) {
            await localForage.removeItem(key);
        }
    });

    for (const key of Object.keys(cacheKeys)) {
        await localForage.removeItem((cacheKeys as any)[key]);
    }
}

async function getCardInfo(cardIds: string | string[]): Promise<AnkiCard[]> {
    if (!Array.isArray(cardIds))
        cardIds = [cardIds];

    let data = [];
    if (cardIds.length > 0) {
        data = await invoke("cardsInfo", 6, {"cards": cardIds});
    }

    return data;
}

type AnkiRequest = {
    action: string,
    params: {
        query: string,
    }
};

export default {
    connect: () => connect(),
    getDecks: getDeckNames,
    flushCache: flushCache,
    getDeckNamesAndIds: getDeckNamesAndIds,
    getDeckNamesAndIdsWithoutCache: getDeckNamesAndIdsWithoutCache,
    getNumCardsReviewedByDay: () => invoke("getNumCardsReviewedByDay", 6),
    getCollectionStatsHtml: () => invoke("getCollectionStatsHTML", 6),
    getCardReviews: getCardReviews,
    getAllReviewsByDeck: getAllReviewsByDeck,
    findCards: findCards,
    getDeckConfig: (deck: string) => invoke("getDeckConfig", 6, {"deck": deck}),
    requestPermission: requestPermission,
    sendMultiRequest: (requests: AnkiRequest[]) => invoke("multi", 6, {"actions": requests}),
    getCardInfo: getCardInfo,
    getAllCardIdsByDeck: (deck: string) => findCards(`deck:"${deck}"`)
}
