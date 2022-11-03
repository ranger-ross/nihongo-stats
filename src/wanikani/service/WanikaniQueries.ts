import {useQueries, useQuery} from "@tanstack/react-query";
import WanikaniApiService, {fetchWanikani} from "./WanikaniApiService";
import {alwaysRetryOnRateLimit, combineResults} from "../../util/ReactQueryUtils";
import {
    mapWanikaniAssignment,
    mapWanikaniLevelProgression,
    mapWanikaniReset,
    mapWanikaniSubject,
    mapWanikaniSummary,
    mapWanikaniUser
} from "./WanikaniMappingService";
import {APP_URLS} from "../../Constants";
import {WanikaniSubject} from "../models/WanikaniSubject";
import {RawWanikaniSubjectResponse} from "../models/raw/RawWanikaniSubjectResponse";

function buildWanikaniSubjectQueries(firstPageData: RawWanikaniSubjectResponse | undefined): string[] {
    if (!firstPageData) {
        return [];
    }

    const totalCount = firstPageData.total_count;
    const totalPages = Math.ceil(totalCount / 1000);

    const queries = [];
    queries.push(APP_URLS.wanikaniApi + '/v2/subjects');
    for (let i = 1; i < totalPages; i++) {
        queries.push(APP_URLS.wanikaniApi + '/v2/subjects?page_after_id=' + (i * 1000))
    }

    return queries;
}

export function useWanikaniSubjects(enabled = true) {
    const staleTime = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks

    const firstPageUrl = APP_URLS.wanikaniApi + '/v2/subjects';
    const firstPageQuery = useQuery<RawWanikaniSubjectResponse>(["WanikaniSubjectFirstPage"],
        () => fetchWanikani(firstPageUrl), {
            enabled: enabled,
            cacheTime: Infinity,
            staleTime: staleTime,
        });

    const queries = buildWanikaniSubjectQueries(firstPageQuery.data);

    const results = useQueries({
        queries: queries.map(query => ({
            queryKey: [query],
            queryFn: () => fetchWanikani(query),
            cacheTime: Infinity,
            staleTime: staleTime,
            select: (data: any) => data.data.map(mapWanikaniSubject),
        }))
    });

    const isFetching = results.some((query) => query.isFetching);
    const data = isFetching ? [] : combineResults<WanikaniSubject>(results);

    return {
        data: data,
        isFetching: isFetching,
        isLoading: results.some((query) => query.isLoading),
        isRefetching: results.some((query) => query.isRefetching),
    };
}

export function useWanikaniAssignments(enabled = true) {
    return useQuery(['wanikaniAssignments'], () => WanikaniApiService.getAllAssignments(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 5 * 60 * 1000,
        select: (data) => data.map(mapWanikaniAssignment)
    });
}

export function useWanikaniSummary(enabled = true) {
    return useQuery(['wanikaniSummary'], () => WanikaniApiService.getSummary(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 1000 * 60,
        select: (data) => mapWanikaniSummary(data)
    });
}

export function useWanikaniResets(enabled = true) {
    return useQuery(['wanikaniResets'], () => WanikaniApiService.getResets(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 1000 * 60 * 10,
        select: (data) => data.data.map(mapWanikaniReset)
    });
}

export function useWanikaniLevelProgress(enabled = true) {
    return useQuery(['wanikaniLevelProgress'], () => WanikaniApiService.getLevelProgress(), {
        enabled: enabled,
        cacheTime: Infinity,
        staleTime: 60 * 1000,
        select: (data) => data.data.map(mapWanikaniLevelProgression)
    });
}

export function useWanikaniUser(enabled = true) {
    return useQuery(['wanikaniUser'], () => WanikaniApiService.getUser(), {
        enabled: enabled,
        cacheTime: 24 * 60 * 60 * 1000,
        staleTime: 30 * 1000,
        retry: alwaysRetryOnRateLimit(3),
        select: (data) => mapWanikaniUser(data)
    });
}
