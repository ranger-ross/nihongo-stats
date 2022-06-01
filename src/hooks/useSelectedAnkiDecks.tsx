import create from "zustand";
import {persist} from "zustand/middleware"

type SelectedAnkiDecksState = {
    selectedDecks: string[],
    setSelectedDecks: (decks: string[]) => void
}

export const useSelectedAnkiDecks = create(persist<SelectedAnkiDecksState>(
    (set) => ({
        selectedDecks: [],
        setSelectedDecks: (decks: string[]) => set(() => {
            const sorted = !!decks ? decks.sort() : [];
            return {selectedDecks: sorted};
        }),
    }),
    {
        name: 'anki-selected-decks'
    }));
