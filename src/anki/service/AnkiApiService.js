import * as localForage from "localforage/dist/localforage"
import {AppUrls} from "../../Constants";

const ankiConnectApiUrl = AppUrls.ankiApi;

const cacheKeys = {
    decks: 'anki-deck-names-and-ids',
    cardInfo: 'anki-card-info',
    reviewsPrefix: 'anki-reviews-'
}

function invoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
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


function convertDeckMapToArray(decks) {
    let arr = [];
    for (const name of Object.keys(decks)) {
        const id = decks[name];
        arr.push({
            id,
            name
        });
    }
    return arr;
}

function createCardReviewFromTuple(tuple) {
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

function getCardReviews(deckName, startTimestamp = new Date(2000, 0, 1).getTime()) {
    return invoke("cardReviews", 6, {
        "deck": deckName,
        "startID": startTimestamp
    }).then(data => data.map(createCardReviewFromTuple));
}

function getReviewsCacheKey(deckName) {
    return `${cacheKeys.reviewsPrefix}${deckName}`;
}

async function getAllReviewsByDeck(deckName) {
    let cachedValue = await localForage.getItem(getReviewsCacheKey(deckName));
    let reviews;
    if (!!cachedValue && cachedValue.data.length > 0) {
        reviews = cachedValue.data;
        if (cachedValue.lastUpdate > Date.now() - 1000 * 60 * 3) {
            return reviews;
        }
        let timestamp = reviews[reviews.length - 1].reviewTime + 1;
        reviews.push(...(await getCardReviews(deckName, timestamp)));
    } else {
        reviews = await getCardReviews(deckName);
    }
    reviews = reviews.sort((a, b) => a.reviewTime - b.reviewTime);
    localForage.setItem(getReviewsCacheKey(deckName), {
        data: reviews,
        lastUpdate: Date.now()
    });
    return reviews;
}

async function getDeckNamesAndIds() {
    let cachedValue = await localForage.getItem(cacheKeys.decks);
    if (!!cachedValue && cachedValue.lastUpdate > Date.now() - 1000 * 60 * 60 * 5) {
        return cachedValue.data;
    }
    let data = await invoke("deckNamesAndIds", 6).then(convertDeckMapToArray);
    data = data.filter(deck => deck.name.toLowerCase() !== 'default')
    localForage.setItem(cacheKeys.decks, {
        data: data,
        lastUpdate: Date.now()
    });
    return data;
}

async function getDeckNames() {
    const data = await getDeckNamesAndIds();
    return data.map(deck => deck.name);
}

// See Docs: https://docs.ankiweb.net/searching.html
function findCards(query) {
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
        await localForage.removeItem(cacheKeys[key]);
    }
}

async function getCardInfo(cardIds) {
    if (!Array.isArray(cardIds))
        cardIds = [cardIds];

    let results = []
    let cardsToQuery = [];

    let cachedValue = await localForage.getItem(cacheKeys.cardInfo);
    if (!!cachedValue) {
        for (const cardId of cardIds) {
            const cachedEntry = cachedValue[cardId];
            if (cachedEntry && cachedEntry.lastUpdate > Date.now() - 1000 * 60 * 60 * 3) {
                results.push(cachedEntry.card)
            } else {
                cardsToQuery.push(cardId);
            }
        }
    } else {
        cachedValue = {};
        cardsToQuery = cardIds;
    }
    let data = [];
    if (cardsToQuery.length > 0) {
        data = await invoke("cardsInfo", 6, {"cards": cardsToQuery});
    }

    results.push(...data)

    for (const card of data) {
        cachedValue[card.cardId] = {
            card: card,
            lastUpdate: Date.now()
        }
    }
    await localForage.setItem(cacheKeys.cardInfo, cachedValue);

    return results;
}

export default {
    connect: () => connect(),
    getDecks: getDeckNames,
    flushCache: flushCache,
    getDeckNamesAndIds: getDeckNamesAndIds,
    getNumCardsReviewedByDay: () => invoke("getNumCardsReviewedByDay", 6),
    getCollectionStatsHtml: () => invoke("getCollectionStatsHTML", 6),
    getCardReviews: getCardReviews,
    getAllReviewsByDeck: getAllReviewsByDeck,
    findCards: findCards,
    getDeckConfig: (deck) => invoke("getDeckConfig", 6, {"deck": deck}),
    requestPermission: requestPermission,
    sendMultiRequest: (requests) => invoke("multi", 6, {"actions": requests}),
    getCardInfo: getCardInfo,
    getAllCardIdsByDeck: deck => findCards(`deck:"${deck}"`)
}
