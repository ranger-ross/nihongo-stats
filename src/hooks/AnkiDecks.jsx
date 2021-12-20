import {useState, useEffect} from 'react';
import AnkiApiService from "../anki/service/AnkiApiService.js";

function loadSelectedDecks() {
    const data = localStorage.getItem('anki-selected-decks');
    return !!data ? JSON.parse(data) : [];
}

export const useAnkiDecks = () => {
    const [decks, setDecks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(async () => {
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


export const useSelectedAnkiDecks = () => {
    const [selectedDecks, setSelectedDecks] = useState(loadSelectedDecks());

    useEffect(async () => {
        let isSubscribed = true;
        if (!selectedDecks || selectedDecks.length === 0) {
            AnkiApiService.getDecks()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setSelectedDecks(data);
                });
        }
        return () => isSubscribed = false;
    }, []);

    const set = (value) => {
        localStorage.setItem('anki-selected-decks', JSON.stringify(value));
        setSelectedDecks(value);
    }

    return [selectedDecks, set];
};

