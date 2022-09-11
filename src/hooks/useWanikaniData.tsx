import {useEffect, useState} from "react";
import {WanikaniReview} from "../wanikani/models/WanikaniReview";
import WanikaniApiService from "../wanikani/service/WanikaniApiService";
import {EVENT_STATUS, MultiPageObservableEvent} from "../wanikani/service/WanikaniApiServiceRxJs";
import create from "zustand";
import {
    useWanikaniAssignments, useWanikaniLevelProgress,
    useWanikaniResets,
    useWanikaniSubjects,
    useWanikaniSummary, useWanikaniUser
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

    const {data: user, isLoading: isUserLoading} = useWanikaniUser(config.user)
    const {data: subjects, isLoading: isSubjectsLoading} = useWanikaniSubjects(config.subjects)
    const {data: assignments, isLoading: isAssignmentsLoading} = useWanikaniAssignments(config.assignments)
    const {data: summary, isLoading: isSummaryLoading} = useWanikaniSummary(config.summary)
    const {data: levelProgress, isLoading: isLevelProgressLoading} = useWanikaniLevelProgress(config.levelProgress)
    const {data: resets, isLoading: isResetsLoading} = useWanikaniResets(config.resets)

    const isLoading =
        (config.user && isUserLoading) ||
        (config.summary && isSummaryLoading) ||
        (config.resets && isResetsLoading) ||
        (config.levelProgress && isLevelProgressLoading) ||
        (config.subjects && isSubjectsLoading) ||
        (config.reviews && reviews.length === 0) ||
        (config.assignments && isAssignmentsLoading);

    useEffect(() => {
        let isSubscribed = true;

        if (config.reviews && reviews.length === 0) {
            WanikaniApiService.getReviewAsObservable()
                .subscribe((event: MultiPageObservableEvent<WanikaniReview>) => {
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
        isLoading,
        summary,
        reviewsProgress,
        reviewsIsRateLimited,
        resets: resets ?? []
    }
}
