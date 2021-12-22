import {useState, useEffect} from 'react';
import AnkiApiService from "../anki/service/AnkiApiService.js";

export const useAnkiDecks = () => {
    const [decks, setDecks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isSubscribed = true;
        AnkiApiService.getDecks()
            .then(data => {
                if (!isSubscribed)
                    return;
                setDecks(data);
                setIsLoading(false);
            });
        return () => isSubscribed = false;
    }, []);

    return [decks, isLoading];
};
