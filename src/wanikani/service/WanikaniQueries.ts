import {useQuery} from "@tanstack/react-query";
import WanikaniApiService from "./WanikaniApiService";
import {alwaysRetryOnRateLimit} from "../../util/ReactQueryUtils";
import {
    mapWanikaniAssignment,
    mapWanikaniLevelProgression,
    mapWanikaniReset,
    mapWanikaniSubject,
    mapWanikaniSummary,
    mapWanikaniUser
} from "./WanikaniMappingService";


export function useWanikaniSubjects(enabled = true) {
    return useQuery(['wanikaniSubjects'], () => WanikaniApiService.getSubjects(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 2 * 7 * 24 * 60 * 60 * 1000, // 2 weeks
        select: (data) => data.map(mapWanikaniSubject)
    });
}

export function useWanikaniAssignments(enabled = true) {
    return useQuery(['wanikaniAssignments'], () => WanikaniApiService.getAllAssignments(), {
        enabled: enabled,
        cacheTime: 0,
        select: (data) => data.map(mapWanikaniAssignment)
    });
}

export function useWanikaniSummary(enabled = true) {
    return useQuery(['wanikaniSummary'], () => WanikaniApiService.getSummary(), {
        enabled: enabled,
        cacheTime: 0,
        select: (data) => mapWanikaniSummary(data)
    });
}

export function useWanikaniResets(enabled = true) {
    return useQuery(['wanikaniResets'], () => WanikaniApiService.getResets(), {
        enabled: enabled,
        cacheTime: 0,
        select: (data) => data.data.map(mapWanikaniReset)
    });
}

export function useWanikaniLevelProgress(enabled = true) {
    return useQuery(['wanikaniLevelProgress'], () => WanikaniApiService.getLevelProgress(), {
        enabled: enabled,
        cacheTime: 0,
        select: (data) => data.data.map(mapWanikaniLevelProgression)
    });
}

export function useWanikaniUser(enabled = true) {
    return useQuery(['wanikaniUser'], () => WanikaniApiService.getUser(), {
        enabled: enabled,
        cacheTime: 24 * 60 * 60 * 1000,
        staleTime: 5_000,
        retry: alwaysRetryOnRateLimit(3),
        select: (data) => mapWanikaniUser(data)
    });
}
