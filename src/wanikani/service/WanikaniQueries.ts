import {useQuery} from "@tanstack/react-query";
import WanikaniApiService from "./WanikaniApiService";
import {alwaysRetryOnRateLimit} from "../../util/ReactQueryUtils";
import {mapWanikaniUser} from "./WanikaniMappingService";


export function useWanikaniSubjects(enabled = true) {
    return useQuery(['wanikaniSubjects'], () => WanikaniApiService.getSubjects(), {
        enabled: enabled
    });
}

export function useWanikaniAssignments(enabled = true) {
    return useQuery(['wanikaniAssignments'], () => WanikaniApiService.getAllAssignments(), {
        enabled: enabled
    });
}

export function useWanikaniSummary(enabled = true) {
    return useQuery(['wanikaniSummary'], () => WanikaniApiService.getSummary(), {
        enabled: enabled
    });
}

export function useWanikaniResets(enabled = true) {
    return useQuery(['wanikaniResets'], () => WanikaniApiService.getResets(), {
        enabled: enabled
    });
}

export function useWanikaniLevelProgress(enabled = true) {
    return useQuery(['wanikaniLevelProgress'], () => WanikaniApiService.getLevelProgress(), {
        enabled: enabled
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
