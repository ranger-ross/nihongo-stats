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


export default {
    getDecks: () => invoke("deckNames", 6)

}