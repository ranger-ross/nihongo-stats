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
import {QUERY_CLIENT_THROTTLE_TIME, queryClient} from "../../App";
import {sleep} from "../../util/ReactQueryUtils";
import AnkiApiService from "./AnkiApiService";

const ANKI_QUERY_KEY = 'anki';
const ANKI_STALE_TIME = 10 * 1000;


export function useAnkiDeckSummaries(decks: string[]) {
    return useQuery<AnkiDeckSummary[]>({
        queryKey: [ANKI_QUERY_KEY, 'DeckSummaries', ...decks], 
        queryFn: () => fetchAnkiDeckSummaries(decks), 
        enabled: !!decks && decks.length > 0,
        gcTime: Infinity,
        staleTime: ANKI_STALE_TIME,
    });
}

export function useAnkiCardBreakdown(decks: string[]) {
    return useQuery({
        queryKey:  [ANKI_QUERY_KEY, 'CardBreakDown', ...decks],
        queryFn:  () => fetchCardBreakDownData(decks), 
        enabled: !!decks && decks.length > 0,
        gcTime: Infinity,
        staleTime: ANKI_STALE_TIME,
    });
}

export function useAnkiUpcomingReviews(decks: string[], days: number) {
    return useQuery({
        queryKey:  [ANKI_QUERY_KEY, 'UpcomingReviews', ...decks, days], 
        queryFn: () => fetchAnkiUpcomingReviewData(decks, days), 
        enabled: !!decks && decks.length > 0,
        gcTime: Infinity,
        staleTime: ANKI_STALE_TIME,
        select: data => mapToUpcomingAnkiReviewDataPoints(decks, data)
    });
}

export function useAnkiReviewsByDeck(decks: string[]) {
    return useQuery({
        queryKey:   [ANKI_QUERY_KEY, 'AnkiReviewsByDeck', ...decks], 
        queryFn: () => fetchAnkiReviewsByDeck(decks), 
        enabled: !!decks && decks.length > 0,
        gcTime: Infinity,
        staleTime: ANKI_STALE_TIME,
        select: data => mapToDeckReviews(decks, data)
    });
}

export function useAnkiBreakDownHistory(decks: string[]) {
    return useQuery({
        queryKey:   [ANKI_QUERY_KEY, 'BreakDownHistory', ...decks], 
        queryFn: () => fetchBreakDownHistoryData(decks), 
        enabled: !!decks && decks.length > 0,
        gcTime: Infinity,
        staleTime: ANKI_STALE_TIME,
    });
}


export async function invalidAnkiQueries() {
    queryClient.removeQueries({
        queryKey: [ANKI_QUERY_KEY]
    })
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: [ANKI_QUERY_KEY]
        })   // Wait for React Query to flush cache to disk
            .then(() => sleep(QUERY_CLIENT_THROTTLE_TIME + 1000)),
        AnkiApiService.flushCache()
    ]);
}

