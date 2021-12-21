import {memoryCache} from "../../GlobalState"
import * as localForage from "localforage/dist/localforage"

const ankiConnectApiUrl = 'http://localhost:8765';


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
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
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

async function getAllReviewsByDeck(deckName) {
    let cachedValue = await localForage.getItem(`anki-reviews-${deckName}`);
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
    localForage.setItem(`anki-reviews-${deckName}`, {
        data: reviews,
        lastUpdate: Date.now()
    });
    return reviews;
}

async function getDeckNamesAndIds() {
    let cachedValue = await localForage.getItem(`anki-deck-names-and-ids`);
    if (!!cachedValue && cachedValue.lastUpdate > Date.now() - 1000 * 60 * 60 * 5) {
        return cachedValue.data;
    }
    let data = await invoke("deckNamesAndIds", 6).then(convertDeckMapToArray);
    data = data.filter(deck => deck.name.toLowerCase() !== 'default')
    localForage.setItem(`anki-deck-names-and-ids`, {
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

export default {
    connect: () => connect(),
    getDecks: getDeckNames,
    getDeckNamesAndIds: getDeckNamesAndIds,
    getNumCardsReviewedByDay: () => invoke("getNumCardsReviewedByDay", 6),
    getCollectionStatsHtml: () => invoke("getCollectionStatsHTML", 6),
    getCardReviews: getCardReviews,
    getAllReviewsByDeck: getAllReviewsByDeck,
    findCards: findCards,
    getDeckConfig: (deck) => invoke("getDeckConfig", 6, {"deck": deck}),
    requestPermission: requestPermission

}