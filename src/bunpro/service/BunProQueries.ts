import {useQuery} from "@tanstack/react-query";
import BunProApiService from "./BunProApiService";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {mapBunProGrammarPoint, mapBunProReviewResponse, mapBunProUser} from "./BunProMappingService";


export function useBunProUser(enabled = true) {
    return useQuery(['bunProUser'], () => BunProApiService.getUser(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 1000 * 60,
        select: data => mapBunProUser(data)
    })
}

export function useBunProGrammarPoints(enabled = true) {
    return useQuery(['bunProGrammarPoints'], () => BunProApiService.getGrammarPoints(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 1000 * 60 * 60 * 24 * 3, // 3 days
        select: response => {
            console.log(response);
            return response.data.map((gp: RawBunProGrammarPoint) => mapBunProGrammarPoint(gp))
        }
    })
}

export function useBunProReviews(enabled = true) {
    return useQuery(['bunProReviews'], () => BunProApiService.getAllReviews(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 1000 * 60 * 3,
        select: (data) => mapBunProReviewResponse(data)
    })
}

export function useBunProPendingReviews(enabled = true) {
    return useQuery(['bunProPendingReviews'], () => BunProApiService.getPendingReviews(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 1000 * 60 * 3,
    })
}
