import {useState, useEffect} from 'react';
import AnkiApiService from "../anki/service/AnkiApiService.js";
import create from "zustand";
import {persist} from "zustand/middleware"

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

export const useSelectedAnkiDecks = create(persist(
    (set) => ({
        selectedDecks: [],
        setSelectedDecks: (decks) => set(() => ({selectedDecks: decks})),
    }),
    {
        name: 'anki-selected-decks'
    }));