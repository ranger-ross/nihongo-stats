import {RetryValue} from "@tanstack/query-core/src/retryer";
import {UseQueryResult} from "@tanstack/react-query";

export const RATE_LIMIT_ERROR = new Error("Rate-Limited")

export function isRateLimited(response: Response) {
    return response?.status === 429
}

export function throwIfRateLimited(response: Response) {
    if (isRateLimited(response)) {
        throw RATE_LIMIT_ERROR
    }
}

/**
 * A React Query retry function that will always retry on a RATE_LIMIT_ERROR.
 *
 *
 * @param retries The retry count for other errors
 */
export function alwaysRetryOnRateLimit(retries = 3): RetryValue<any> {
    return (failureCount, error) => {
        if (RATE_LIMIT_ERROR === error) {
            return true;
        }
        return failureCount < retries;
    }
}

/**
 * Util function used to combine list results from useQueries()
 */
export const combineResults = <T extends object>(
    data: UseQueryResult<T[]>[]
): T[] =>
    data.reduce((acc, curr) => {
        if (!curr.data) return acc;
        return [...acc, ...curr.data];
    }, [] as T[]);

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

