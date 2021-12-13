import { memoryCache } from "../../GlobalState"
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
        xhr.send(JSON.stringify({ action, version, params }));
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

export default {
    getDecks: () => invoke("deckNames", 6),
    getDeckNamesAndIds: () => invoke("deckNamesAndIds", 6).then(convertDeckMapToArray),
    getNumCardsReviewedByDay: () => invoke("getNumCardsReviewedByDay", 6),
    getCollectionStatsHtml: () => invoke("getCollectionStatsHTML", 6),
    getCardReviews: (deckName = "default", startTimestamp = new Date(2000, 0, 1).getTime()) => invoke("cardReviews", 6, {
        "deck": deckName,
        "startID": startTimestamp
    }).then(data => data.map(createCardReviewFromTuple)),


}