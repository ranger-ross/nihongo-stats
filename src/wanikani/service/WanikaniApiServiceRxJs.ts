import * as localForage from "localforage";
import {APP_URLS} from "../../Constants";
import {Observable, Subject} from "rxjs";
import {RawWanikaniReview} from "../models/raw/RawWanikaniReview";
import {sleep} from "../../util/ReactQueryUtils";
import * as Sentry from "@sentry/react";

const wanikaniApiUrl = APP_URLS.wanikaniApi;
const cacheKeys = {
    apiKey: 'wanikani-api-key',
    reviews: 'wanikani-reviews',
    user: 'wanikani-user',
    login: 'wanikani-login',
    subjects: 'wanikani-subjects',
    assignments: 'wanikani-assignments',
    summary: 'wanikani-summary',
    levelProgression: 'wanikani-level-progressions',
    assignmentsForLevelPrefix: 'wanikani-assignment-for-level-'
}

const authHeader = (apiKey: string) => ({'Authorization': `Bearer ${apiKey}`})

export const EVENT_STATUS = {
    RATE_LIMITED: 'rate-limited',
    COMPLETE: 'complete',
    IN_PROGRESS: 'in-progress',
};

function fetchWithAutoRetry(input: string) {
    const subject = new Subject<{ status: string, response?: Response }>();

    async function tryRequest(attempts: number) {
        try {
            const response = await fetch(input, {
                headers: {
                    ...authHeader(apiKey()),
                },
            });

            if ([429, 401].includes(response.status) && attempts < 10) {
                subject.next({
                    status: EVENT_STATUS.RATE_LIMITED,
                });
                await sleep(10_000);
                tryRequest(attempts + 1);
                return;
            }
            subject.next({
                status: EVENT_STATUS.COMPLETE,
                response: response
            });
        } catch (error) {
            console.error(error);
            subject.error({
                error: error
            });
        }

    }

    tryRequest(0);

    return subject.asObservable();
}

function apiKey() {
    return localStorage.getItem(cacheKeys.apiKey) as string
}

function sortAndDeduplicateReviews(reviews: RawWanikaniReview[]) {
    const map: { [id: string]: RawWanikaniReview } = {};

    for (const review of reviews) {
        map[review.id] = review;
    }

    const result: RawWanikaniReview[] = [];

    for (const key of Object.keys(map)) {
        result.push(map[key]);
    }

    return result.sort((a, b) => a.id - b.id);
}

export type MultiPageObservableEvent<T> = {
    status: string,
    size?: number,
    progress?: number,
    partialData?: T[],
    data?: T[],
};

/**
 * NOTE: progress will not take into account any data before the startingId
 */
function fetchMultiPageRequestObservable(path: string, startingId?: number) {
    const subject = new Subject<MultiPageObservableEvent<RawWanikaniReview>>();

    const startingPageParam = !!startingId ? `?page_after_id=${startingId}` : '';
    fetchWithAutoRetry(`${wanikaniApiUrl}${path}${startingPageParam}`)
        .subscribe(async (event) => {
            if (event.status === EVENT_STATUS.RATE_LIMITED) {
                subject.next({
                    status: EVENT_STATUS.RATE_LIMITED,
                });
                return;
            }

            const firstPageResponse = event.response as Response;

            let firstPage: any;
            let nextPage: string;
            let data: any;
            try {
                firstPage = await firstPageResponse.json();
                data = firstPage.data;
                nextPage = firstPage.pages['next_url']
            } catch (err) {
                Sentry.captureMessage(`Reviews page (first) exception, status ${firstPageResponse.status}`)
                throw err;
            }

            function tryNextPage() {
                fetchWithAutoRetry(nextPage)
                    .subscribe(async (event) => {
                        if (event.status === EVENT_STATUS.RATE_LIMITED) {
                            subject.next({
                                status: EVENT_STATUS.RATE_LIMITED,
                            });
                            return;
                        }

                        const pageResponse = event.response as Response;

                        try {
                            const page = await pageResponse.json();
                            data = data.concat(page.data);
                            nextPage = page.pages['next_url'];
                        } catch (err) {
                            Sentry.captureMessage(`Reviews page exception, status ${pageResponse.status}`)
                            throw err;
                        }

                        if (!!nextPage) {
                            subject.next({
                                status: EVENT_STATUS.IN_PROGRESS,
                                size: firstPage['total_count'],
                                progress: data.length,
                                partialData: data,
                            });
                            tryNextPage()
                        } else {
                            subject.next({
                                status: EVENT_STATUS.COMPLETE,
                                data: data
                            });
                        }
                    });
            }

            if (!!nextPage) {
                subject.next({
                    status: EVENT_STATUS.IN_PROGRESS,
                    size: firstPage['total_count'],
                    progress: data.length,
                    partialData: data,
                });

                tryNextPage();
            } else {
                subject.next({
                    status: EVENT_STATUS.COMPLETE,
                    data: data
                });
            }
        });

    return subject.asObservable();
}

function getReviews(): Observable<MultiPageObservableEvent<RawWanikaniReview>> {
    const subject = new Subject<MultiPageObservableEvent<RawWanikaniReview>>();

    const complete = (data: RawWanikaniReview[]) => subject.next({
        status: EVENT_STATUS.COMPLETE,
        data: data,
    });

    const inProgress = (size: number, progress: number) => subject.next({
        status: EVENT_STATUS.IN_PROGRESS,
        size: size,
        progress: progress
    });

    const rateLimited = () => subject.next({status: EVENT_STATUS.RATE_LIMITED});

    function handleEvent(event: MultiPageObservableEvent<RawWanikaniReview>, reviews: RawWanikaniReview[] = []) {
        function save(partialData: RawWanikaniReview[]) {
            const reviewsToSave = sortAndDeduplicateReviews([...reviews, ...partialData]);

            const cacheObject = {
                data: reviewsToSave,
                lastUpdated: new Date().getTime(),
            };
            localForage.setItem(cacheKeys.reviews, cacheObject);
            return cacheObject.data;
        }

        switch (event.status) {
            case EVENT_STATUS.COMPLETE: {
                const data = save(event.data ?? []);
                complete(data)
                return;
            }
            case EVENT_STATUS.RATE_LIMITED: {
                rateLimited();
                return;
            }
            case EVENT_STATUS.IN_PROGRESS: {
                save(event.partialData ?? []);
                inProgress(event.size as number, event.progress as number + reviews.length);
                return;
            }
        }

    }

    const fetchReviews = async () => {
        const cachedValue = await localForage.getItem<{
            data: RawWanikaniReview[],
            lastUpdatedAt: number
        }>(cacheKeys.reviews);

        if (cachedValue && cachedValue?.data?.length > 0) {
            const reviews = sortAndDeduplicateReviews(cachedValue.data);
            const lastId = reviews[reviews.length - 1].id;
            fetchMultiPageRequestObservable('/v2/reviews', lastId)
                .subscribe({
                    next: event => handleEvent(event, reviews),
                    error: err => console.error('Failed to update reviews, possibly using stale data', err)
                })
        } else {
            fetchMultiPageRequestObservable('/v2/reviews')
                .subscribe(handleEvent);
        }

    }

    fetchReviews();

    return subject.asObservable();
}

export default {
    getReviewAsObservable: getReviews,
}
