import { useQueries, useQuery } from "@tanstack/react-query";
import WanikaniApiService, { fetchWanikani } from "./WanikaniApiService";
import { alwaysRetryOnRateLimit, combineResults, sleep } from "../../util/ReactQueryUtils";
import {
    mapWanikaniAssignment,
    mapWanikaniLevelProgression,
    mapWanikaniReset,
    mapWanikaniReview,
    mapWanikaniSubject,
    mapWanikaniSummary,
    mapWanikaniUser
} from "./WanikaniMappingService";
import { APP_URLS } from "../../Constants";
import { WanikaniSubject } from "../models/WanikaniSubject";
import { RawWanikaniReview } from "../models/raw/RawWanikaniReview";
import { WanikaniReview } from "../models/WanikaniReview";
import { EVENT_STATUS, MultiPageObservableEvent } from "./WanikaniApiServiceRxJs";
import { RawWanikaniCollectionResponse } from "../models/raw/RawWanikaniCollectionResponse";
import { RawWanikaniSubject } from "../models/raw/RawWanikaniSubject";
import { QUERY_CLIENT_THROTTLE_TIME, queryClient } from "../../App";

const WANIKANI_QUERY_KEY = 'wanikani';

function buildWanikaniSubjectQueries(firstPageData: RawWanikaniCollectionResponse<RawWanikaniSubject> | undefined): string[] {
    if (!firstPageData) {
        return [];
    }

    const totalCount = firstPageData.total_count;
    const totalPages = Math.ceil(totalCount / 1000);

    const queries = [];
    queries.push(APP_URLS.wanikaniApi + '/v2/subjects');
    for (let i = 1; i < totalPages; i++) {
        // TODO: be careful here, `i` is technically not the subjectId,
        //   the index in the list just happens to match the id
        queries.push(APP_URLS.wanikaniApi + '/v2/subjects?page_after_id=' + (i * 1000))
    }

    return queries;
}

export function useWanikaniSubjects(enabled = true) {
    const staleTime = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks

    const firstPageUrl = APP_URLS.wanikaniApi + '/v2/subjects';
    const firstPageQuery = useQuery<RawWanikaniCollectionResponse<RawWanikaniSubject>>({
        queryKey: [WANIKANI_QUERY_KEY, "SubjectFirstPage"],
        queryFn: () => fetchWanikani(firstPageUrl),
        enabled: enabled,
        gcTime: Infinity,
        staleTime: staleTime,
    });

    const queries = buildWanikaniSubjectQueries(firstPageQuery.data);

    const results = useQueries({
        queries: queries.map(query => ({
            queryKey: [WANIKANI_QUERY_KEY, query],
            queryFn: () => fetchWanikani(query),
            gcTime: Infinity,
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
    return useQuery({
        queryKey: [WANIKANI_QUERY_KEY, 'Assignments'], 
        queryFn: () => WanikaniApiService.getAllAssignments(),
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 5 * 60 * 1000,
        select: (data) => data.map(mapWanikaniAssignment)
    });
}

export function useWanikaniSummary(enabled = true) {
    return useQuery({
        queryKey: [WANIKANI_QUERY_KEY, 'Summary'], 
        queryFn: () => WanikaniApiService.getSummary(),
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 1000 * 60,
        select: (data) => mapWanikaniSummary(data)
    });
}

export function useWanikaniResets(enabled = true) {
    return useQuery({
        queryKey: [WANIKANI_QUERY_KEY, 'Resets'], 
        queryFn: () => WanikaniApiService.getResets(), 
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 1000 * 60 * 10,
        select: (data) => data.data.map(mapWanikaniReset)
    });
}

export function useWanikaniLevelProgress(enabled = true) {
    return useQuery( {
        queryKey: [WANIKANI_QUERY_KEY, 'LevelProgress'], 
        queryFn: () => WanikaniApiService.getLevelProgress(),
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 60 * 1000,
        select: (data) => data.data.map(mapWanikaniLevelProgression)
    });
}

export function useWanikaniUser(enabled = true) {
    return useQuery({
        queryKey: [WANIKANI_QUERY_KEY, 'User'],
        queryFn: () => WanikaniApiService.getUser(), 
        enabled: enabled,
        gcTime: Infinity,
        staleTime: 30 * 1000,
        retry: alwaysRetryOnRateLimit(3),
        select: (data) => mapWanikaniUser(data)
    });
}

type OnProgressCallback = (progress: number) => void;
type OnRateLimitedCallback = (isRateLimited: boolean) => void;

export function useWanikaniReviews(enabled = true, onProgress: OnProgressCallback, onRateLimited: OnRateLimitedCallback) {
    return useQuery<RawWanikaniReview[], unknown, WanikaniReview[]>({
        queryKey: [WANIKANI_QUERY_KEY, 'Reviews'],
        queryFn: () => {
            return new Promise<RawWanikaniReview[]>((resolve, reject) => {
                WanikaniApiService.getReviewAsObservable()
                    .subscribe({
                        next: (event: MultiPageObservableEvent<RawWanikaniReview>) => {
                            if (event.status === EVENT_STATUS.IN_PROGRESS) {
                                onProgress((event.progress as number) / (event.size as number));
                            }
                            if (event.status === EVENT_STATUS.COMPLETE) {
                                onProgress(1.0);
                                resolve(event.data ?? []);
                            }
                            onRateLimited(event.status === EVENT_STATUS.RATE_LIMITED);
                        },
                        error: err => reject(err)
                    });
            });
        },
        enabled: enabled,
        gcTime: 7 * 24 * 60 * 60 * 1000,
        staleTime: 30 * 1000,
        select: (data) => data.map(mapWanikaniReview)
    });
}

export async function invalidWanikaniQueries() {
    queryClient.removeQueries({
        queryKey: [WANIKANI_QUERY_KEY]
    })
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: [WANIKANI_QUERY_KEY]
        })   // Wait for React Query to flush cache to disk
            .then(() => sleep(QUERY_CLIENT_THROTTLE_TIME + 1000)),
        WanikaniApiService.flushCache()
    ]);
}
