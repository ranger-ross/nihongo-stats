import {useEffect, useState} from 'react';
import AnkiApiService from "../anki/service/AnkiApiService";

export const useAnkiDecks = (): { decks: string[], isLoading: boolean } => {
    const [decks, setDecks] = useState<string[]>([]);
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
        return () => {
            isSubscribed = false;
        };
    }, []);

    return {
        decks,
        isLoading
    };
};
