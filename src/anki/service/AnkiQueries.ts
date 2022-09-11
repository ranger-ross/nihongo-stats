import {useQuery} from "@tanstack/react-query";
import {
    AnkiDeckSummary,
    fetchAnkiDeckSummaries,
    fetchAnkiUpcomingReviewData,
    fetchCardBreakDownData
} from "./AnkiDataUtil";


export function useAnkiDeckSummaries(decks: string[]) {
    return useQuery<AnkiDeckSummary[]>(['ankiDeckSummaries'], () => fetchAnkiDeckSummaries(decks), {
        enabled: !!decks && decks.length > 0
    });
}

export function useAnkiCardBreakdown(decks: string[]) {
    return useQuery(['ankiCardBreakDown'], () => fetchCardBreakDownData(decks), {
        enabled: !!decks && decks.length > 0
    });
}

export function useAnkiUpcomingReviews(decks: string[], days: number) {
    return useQuery(['ankiUpcomingReviews'], () => fetchAnkiUpcomingReviewData(decks, days), {
        enabled: !!decks && decks.length > 0,
    });
}

