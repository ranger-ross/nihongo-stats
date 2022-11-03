import {useEffect, useState} from "react";
import {WanikaniReview} from "../wanikani/models/WanikaniReview";
import WanikaniApiService from "../wanikani/service/WanikaniApiService";
import {EVENT_STATUS, MultiPageObservableEvent} from "../wanikani/service/WanikaniApiServiceRxJs";
import create from "zustand";
import {
    useWanikaniAssignments,
    useWanikaniLevelProgress,
    useWanikaniResets,
    useWanikaniSubjects,
    useWanikaniSummary,
    useWanikaniUser
} from "../wanikani/service/WanikaniQueries";


type LoadingScreenState = {
    reviews: WanikaniReview[]
    setReviews: (data: WanikaniReview[]) => void
};

const useLoadingScreenState = create<LoadingScreenState>((set) => ({
    reviews: [],
    setReviews: (data: WanikaniReview[]) => set(() => ({reviews: data})),
}));


export type WanikaniDataConfig = {
    summary?: boolean;
    user?: boolean
    subjects?: boolean
    levelProgress?: boolean
    assignments?: boolean
    reviews?: boolean
    resets?: boolean
};

export function useWanikaniData(config: WanikaniDataConfig) {
    const {
        reviews, setReviews,
    } = useLoadingScreenState();

    const [reviewsProgress, setReviewsProgress] = useState<number>(-1.0);
    const [reviewsIsRateLimited, setReviewsIsRateLimited] = useState(false);

    const {data: user, isFetching: isUserFetching} = useWanikaniUser(config.user)
    const {data: subjects, isFetching: isSubjectsFetching} = useWanikaniSubjects(config.subjects)
    const {data: assignments, isFetching: isAssignmentsFetching} = useWanikaniAssignments(config.assignments)
    const {data: summary, isFetching: isSummaryFetching} = useWanikaniSummary(config.summary)
    const {data: levelProgress, isFetching: isLevelProgressFetching} = useWanikaniLevelProgress(config.levelProgress)
    const {data: resets, isFetching: isResetsFetching} = useWanikaniResets(config.resets)

    const isFetching =
        (config.user && isUserFetching) ||
        (config.summary && isSummaryFetching) ||
        (config.resets && isResetsFetching) ||
        (config.levelProgress && isLevelProgressFetching) ||
        (config.subjects && isSubjectsFetching) ||
        (config.reviews && reviews.length === 0) ||
        (config.assignments && isAssignmentsFetching);

    useEffect(() => {
        let isSubscribed = true;

        if (config.reviews && reviews.length === 0) {
            WanikaniApiService.getReviewAsObservable()
                .subscribe((event: MultiPageObservableEvent<WanikaniReview>) => {
                    if (!isSubscribed)
                        return
                    if (event.status === EVENT_STATUS.IN_PROGRESS) {
                        setReviewsProgress((event.progress as number) / (event.size as number));
                    }
                    if (event.status === EVENT_STATUS.COMPLETE) {
                        setReviewsProgress(1.0);
                        setReviews(event.data ?? [])
                    }
                    setReviewsIsRateLimited(event.status === EVENT_STATUS.RATE_LIMITED);
                });
        }

        return () => {
            isSubscribed = false;
        };
    }, []);


    return {
        user,
        subjects: subjects ?? [],
        levelProgress: levelProgress ?? [],
        assignments: assignments ?? [],
        reviews,
        isFetching,
        summary,
        reviewsProgress,
        reviewsIsRateLimited,
        resets: resets ?? []
    }
}
