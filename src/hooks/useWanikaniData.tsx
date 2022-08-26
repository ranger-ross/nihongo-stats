import {useEffect, useState} from "react";
import {WanikaniUser} from "../wanikani/models/WanikaniUser";
import {WanikaniSubject} from "../wanikani/models/WanikaniSubject";
import {WanikaniLevelProgression} from "../wanikani/models/WanikaniLevelProgress";
import {WanikaniAssignment} from "../wanikani/models/WanikaniAssignment";
import {WanikaniReview} from "../wanikani/models/WanikaniReview";
import {WanikaniSummary} from "../wanikani/models/WanikaniSummary";
import WanikaniApiService from "../wanikani/service/WanikaniApiService";
import {EVENT_STATUS, MultiPageObservableEvent} from "../wanikani/service/WanikaniApiServiceRxJs";
import {WanikaniReset} from "../wanikani/models/WanikaniReset";
import create from "zustand";

// Simple wrapper for data arrays that can be empty
// For example, resets can be empty, so `array.length > 0` can not be used to check if the data is loaded
type Loadable<T> = {
    isLoaded: boolean,
    data: T
}

type LoadingScreenState = {
    subjects: WanikaniSubject[],
    user: WanikaniUser | undefined,
    resets: Loadable<WanikaniReset[]>,
    assignments: WanikaniAssignment[]
    reviews: WanikaniReview[]
    summary: WanikaniSummary | undefined
    levelProgress: WanikaniLevelProgression[]

    setUser: (data: WanikaniUser) => void
    setResets: (data: WanikaniReset[]) => void
    setSubjects: (data: WanikaniSubject[]) => void
    setLevelProgress: (data: WanikaniLevelProgression[]) => void
    setAssignments: (data: WanikaniAssignment[]) => void
    setReviews: (data: WanikaniReview[]) => void
    setSummary: (data: WanikaniSummary) => void
};

const useLoadingScreenState = create<LoadingScreenState>((set) => ({
    user: undefined,
    summary: undefined,
    resets: {
        isLoaded: false,
        data: []
    },
    subjects: [],
    reviews: [],
    levelProgress: [],
    assignments: [],

    setUser: (data: WanikaniUser) => set(() => ({user: data})),
    setResets: (data: WanikaniReset[]) => set(() => ({resets: {isLoaded: true, data: data}})),
    setSubjects: (data: WanikaniSubject[]) => set(() => ({subjects: data})),
    setReviews: (data: WanikaniReview[]) => set(() => ({reviews: data})),
    setAssignments: (data: WanikaniAssignment[]) => set(() => ({assignments: data})),
    setLevelProgress: (data: WanikaniLevelProgression[]) => set(() => ({levelProgress: data})),
    setSummary: (data: WanikaniSummary) => set(() => ({summary: data})),
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
        user, setUser,
        subjects, setSubjects,
        resets, setResets,
        levelProgress, setLevelProgress,
        assignments, setAssignments,
        reviews, setReviews,
        summary, setSummary,
    } = useLoadingScreenState();

    const [reviewsProgress, setReviewsProgress] = useState<number>(-1.0);
    const [reviewsIsRateLimited, setReviewsIsRateLimited] = useState(false);

    const isLoading = (config.user && !user) ||
        (config.summary && !summary) ||
        (config.resets && !resets.isLoaded) ||
        (config.levelProgress && levelProgress.length === 0) ||
        (config.subjects && subjects.length === 0) ||
        (config.reviews && reviews.length === 0) ||
        (config.assignments && assignments.length === 0);

    useEffect(() => {
        let isSubscribed = true;

        if (config.user && !user) {
            WanikaniApiService.getUser()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setUser(data);
                });
        }

        if (config.summary && !summary) {
            WanikaniApiService.getSummary()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setSummary(data);
                });
        }

        if (config.subjects && subjects.length === 0) {
            WanikaniApiService.getSubjects()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setSubjects(data);
                });
        }

        if (config.levelProgress && levelProgress.length === 0) {
            WanikaniApiService.getLevelProgress()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setLevelProgress(data);
                });
        }

        if (config.resets && !resets.isLoaded) {
            WanikaniApiService.getResets()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setResets(data);
                });
        }

        if (config.assignments && assignments.length === 0) {
            WanikaniApiService.getAllAssignments()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setAssignments(data);
                });
        }

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
        subjects,
        levelProgress,
        assignments,
        reviews,
        isLoading,
        summary,
        reviewsProgress,
        reviewsIsRateLimited,
        resets
    }
}