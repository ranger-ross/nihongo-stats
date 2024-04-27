import {useQuery} from "@tanstack/react-query";
import BunProApiService from "./BunProApiService";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {mapBunProGrammarPoint, mapBunProReviewResponse, mapBunProUser} from "./BunProMappingService";
import {QUERY_CLIENT_THROTTLE_TIME, queryClient} from "../../App";
import {sleep} from "../../util/ReactQueryUtils";

const BUNPRO_QUERY_KEY = 'bunpro';

export function useBunProUser(enabled = true) {
    return useQuery({
        queryKey: [BUNPRO_QUERY_KEY, 'User'], 
        queryFn:  () => BunProApiService.getUser(), 
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 1000 * 15,
        select: data => mapBunProUser(data)
    })
}

export function useBunProGrammarPoints(enabled = true) {
    return useQuery({
        queryKey: [BUNPRO_QUERY_KEY, 'GrammarPoints'],
        queryFn:  () => BunProApiService.getGrammarPoints(), 
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 1000 * 60 * 60 * 24,
        select: response => response.data.map((gp: RawBunProGrammarPoint) => mapBunProGrammarPoint(gp))
    })
}

export function useBunProReviews(enabled = true) {
    return useQuery( {
        queryKey: [BUNPRO_QUERY_KEY, 'Reviews'],
        queryFn: () => BunProApiService.getAllReviews(),
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 1000 * 60,
        select: (data) => mapBunProReviewResponse(data)
    })
}

export function useBunProPendingReviews(enabled = true) {
    return useQuery({
        queryKey: [BUNPRO_QUERY_KEY, 'PendingReviews'], 
        queryFn: () => BunProApiService.getPendingReviews(), 
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 1000 * 60,
    })
}

export async function invalidBunProQueries() {
    queryClient.removeQueries({
        queryKey: [BUNPRO_QUERY_KEY]
    })
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: [BUNPRO_QUERY_KEY]
        })   // Wait for React Query to flush cache to disk
            .then(() => sleep(QUERY_CLIENT_THROTTLE_TIME + 1000)),
        BunProApiService.flushCache()
    ]);
}

