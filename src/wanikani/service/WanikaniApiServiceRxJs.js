import * as localForage from "localforage/dist/localforage"
import InMemoryCache from "../../util/InMemoryCache.js";
import {AppUrls} from "../../Constants.js";
import {Subject} from "rxjs";

const memoryCache = new InMemoryCache();

const wanikaniApiUrl = AppUrls.wanikaniApi;
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

const authHeader = (apiKey) => ({'Authorization': `Bearer ${apiKey}`})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const EVENT_STATUS = {
    RATE_LIMITED: 'rate-limited',
    COMPLETE: 'complete',
    IN_PROGRESS: 'in-progress',
};

function fetchWithAutoRetry(input, init) {
    const subject = new Subject();

    async function tryRequest(attempts) {
        const response = await fetch(input, init);

        if (response.status == 429 && attempts < 10) {
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
        })
    }

    tryRequest(0);

    return subject.asObservable();
}

function apiKey() {
    return localStorage.getItem(cacheKeys.apiKey)
}

function sortAndDeduplicateReviews(reviews) {
    let map = {};

    for (const review of reviews) {
        map[review.id] = review;
    }

    let result = [];

    for (const key of Object.keys(map)) {
        result.push(map[key]);
    }

    return result.sort((a, b) => a.id - b.id);
}


/**
 * NOTE: progress will not take into account any data before the startingId
 */
function fetchMultiPageRequestObservable(path, startingId) {
    let subject = new Subject();

    let options = {
        headers: {
            ...authHeader(apiKey()),
        },
    };

    const startingPageParam = !!startingId ? `?page_after_id=${startingId}` : '';
    fetchWithAutoRetry(`${wanikaniApiUrl}${path}${startingPageParam}`, options)
        .subscribe(async (event) => {
            if (event.status === EVENT_STATUS.RATE_LIMITED) {
                subject.next({
                    status: EVENT_STATUS.RATE_LIMITED,
                });
                return;
            }

            const firstPageResponse = event.response;

            const firstPage = await firstPageResponse.json();

            let data = firstPage.data;
            let nextPage = firstPage.pages['next_url']

            function tryNextPage() {
                fetchWithAutoRetry(nextPage, options)
                    .subscribe(async (event) => {
                        if (event.status === EVENT_STATUS.RATE_LIMITED) {
                            subject.next({
                                status: EVENT_STATUS.RATE_LIMITED,
                            });
                            return;
                        }

                        const pageResponse = event.response;

                        let page = await pageResponse.json();
                        data = data.concat(page.data);
                        nextPage = page.pages['next_url'];
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

function getReviews() {
    let subject = new Subject();

    const complete = (data) => subject.next({
        status: EVENT_STATUS.COMPLETE,
        data: data,
    });

    const inProgress = (size, progress) => subject.next({
        status: EVENT_STATUS.IN_PROGRESS,
        size: size,
        progress: progress
    });

    const rateLimited = () => subject.next({status: EVENT_STATUS.RATE_LIMITED});

    function handleEvent(event, reviews = []) {
        function save(partialData, saveToMemCache = false) {
            const reviewsToSave = sortAndDeduplicateReviews([...reviews, ...partialData]);

            const cacheObject = {
                data: reviewsToSave,
                lastUpdated: new Date().getTime(),
            };
            localForage.setItem(cacheKeys.reviews, cacheObject);
            if (saveToMemCache) {
                memoryCache.put(cacheKeys.reviews, cacheObject);
            }
            return cacheObject.data;
        }

        switch (event.status) {
            case EVENT_STATUS.COMPLETE: {
                const data = save(event.data);
                complete(data)
                return;
            }
            case EVENT_STATUS.RATE_LIMITED: {
                rateLimited();
                return;
            }
            case EVENT_STATUS.IN_PROGRESS: {
                save(event.partialData);
                inProgress(event.size, event.progress + reviews.length);
                return;
            }
        }

    }

    const fetchReviews = async () => {
        const cachedValue = await localForage.getItem(cacheKeys.reviews);

        if (cachedValue?.data?.length > 0) {
            let reviews = sortAndDeduplicateReviews(cachedValue.data);
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
