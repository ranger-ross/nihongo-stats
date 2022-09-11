import {useQuery} from "@tanstack/react-query";
import {
    AnkiDeckSummary,
    fetchAnkiDeckSummaries,
    fetchAnkiReviewsByDeck,
    fetchAnkiUpcomingReviewData,
    fetchCardBreakDownData
} from "./AnkiDataUtil";


export function useAnkiDeckSummaries(decks: string[]) {
    return useQuery<AnkiDeckSummary[]>(['ankiDeckSummaries', ...decks], () => fetchAnkiDeckSummaries(decks), {
        enabled: !!decks && decks.length > 0
    });
}

export function useAnkiCardBreakdown(decks: string[]) {
    return useQuery(['ankiCardBreakDown', ...decks], () => fetchCardBreakDownData(decks), {
        enabled: !!decks && decks.length > 0
    });
}

export function useAnkiUpcomingReviews(decks: string[], days: number) {
    return useQuery(['ankiUpcomingReviews', ...decks], () => fetchAnkiUpcomingReviewData(decks, days), {
        enabled: !!decks && decks.length > 0,
    });
}

export function useAnkiReviewsByDeck(decks: string[]) {
    return useQuery(['ankiAnkiReviewsByDeck', ...decks], () => fetchAnkiReviewsByDeck(decks), {
        enabled: !!decks && decks.length > 0,
    });
}
