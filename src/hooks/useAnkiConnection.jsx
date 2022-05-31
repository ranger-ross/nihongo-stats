import {useState, useEffect} from 'react';
import AnkiApiService from "../anki/service/AnkiApiService.ts";

const pollingFrequency = 4_000;

export const useAnkiConnection = () => {
    const [isAnkiConnected, setIsAnkiConnected] = useState(false);

    function checkConnection() {
        AnkiApiService.connect()
            .then(isConnected => {
                console.debug('Checking Anki Connection result', {isConnected, previousResult: isAnkiConnected})

                if (isAnkiConnected != isConnected) {
                    setIsAnkiConnected(isConnected)
                }
            })
            .catch(() => {
                if (isAnkiConnected) {
                    setIsAnkiConnected(false);
                }
            });
    }

    useEffect(() => {
        checkConnection()
        const id = setInterval(checkConnection, pollingFrequency);
        return () => clearInterval(id)
    }, [isAnkiConnected]);

    return isAnkiConnected;
};

