import {useQuery} from "@tanstack/react-query";
import BunProApiService from "./BunProApiService";


export function useBunProUser(enabled = true) {
    return useQuery(['bunProUser'], () => BunProApiService.getUser(), {
        enabled: enabled
    })
}

export function useBunProGrammarPoints(enabled = true) {
    return useQuery(['bunProGrammarPoints'], () => BunProApiService.getGrammarPoints(), {
        enabled: enabled
    })
}

export function useBunProReviews(enabled = true) {
    return useQuery(['bunProReviews'], () => BunProApiService.getAllReviews(), {
        enabled: enabled
    })
}

export function useBunProPendingReviews(enabled = true) {
    return useQuery(['bunProPendingReviews'], () => BunProApiService.getPendingReviews(), {
        enabled: enabled
    })
}
