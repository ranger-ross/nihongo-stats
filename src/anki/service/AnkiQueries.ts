import {useQuery} from "@tanstack/react-query";
import {
    AnkiDeckSummary,
    fetchAnkiDeckSummaries,
    fetchAnkiReviewsByDeck,
    fetchAnkiUpcomingReviewData,
    fetchBreakDownHistoryData,
    fetchCardBreakDownData,
    mapToDeckReviews,
    mapToUpcomingAnkiReviewDataPoints
} from "./AnkiDataUtil";

const ANKI_STALE_TIME = 10 * 1000;


export function useAnkiDeckSummaries(decks: string[]) {
    return useQuery<AnkiDeckSummary[]>(['ankiDeckSummaries', ...decks], () => fetchAnkiDeckSummaries(decks), {
        enabled: !!decks && decks.length > 0,
        cacheTime: Infinity,
        staleTime: ANKI_STALE_TIME,
    });
}

export function useAnkiCardBreakdown(decks: string[]) {
    return useQuery(['ankiCardBreakDown', ...decks], () => fetchCardBreakDownData(decks), {
        enabled: !!decks && decks.length > 0,
        cacheTime: Infinity,
        staleTime: ANKI_STALE_TIME,
    });
}

export function useAnkiUpcomingReviews(decks: string[], days: number) {
    return useQuery(['ankiUpcomingReviews', ...decks, days], () => fetchAnkiUpcomingReviewData(decks, days), {
        enabled: !!decks && decks.length > 0,
        cacheTime: Infinity,
        staleTime: ANKI_STALE_TIME,
        select: data => mapToUpcomingAnkiReviewDataPoints(decks, data)
    });
}

export function useAnkiReviewsByDeck(decks: string[]) {
    return useQuery(['ankiAnkiReviewsByDeck', ...decks], () => fetchAnkiReviewsByDeck(decks), {
        enabled: !!decks && decks.length > 0,
        cacheTime: Infinity,
        staleTime: ANKI_STALE_TIME,
        select: data => mapToDeckReviews(decks, data)
    });
}

export function useAnkiBreakDownHistory(decks: string[]) {
    return useQuery(['ankiBreakDownHistory', ...decks], () => fetchBreakDownHistoryData(decks), {
        enabled: !!decks && decks.length > 0,
        cacheTime: Infinity,
        staleTime: ANKI_STALE_TIME,
    });
}
