import create from "zustand";
import {persist} from "zustand/middleware"

export const useSelectedAnkiDecks = create(persist(
    (set) => ({
        selectedDecks: [],
        setSelectedDecks: (decks) => set(() => {
            const sorted = !!decks ? decks.sort() : [];
            return {selectedDecks: sorted};
        }),
    }),
    {
        name: 'anki-selected-decks'
    }));