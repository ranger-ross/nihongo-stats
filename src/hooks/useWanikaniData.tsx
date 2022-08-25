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

// Simple wrapper for data arrays that can be empty
// For example, resets can be empty, so `array.length > 0` can not be used to check if the data is loaded
type Loadable<T> = {
    isLoaded: boolean,
    data: T
}


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
    const [user, setUser] = useState<WanikaniUser>();
    const [subjects, setSubjects] = useState<WanikaniSubject[]>([]);
    const [levelProgress, setLevelProgress] = useState<WanikaniLevelProgression[]>([]);
    const [assignments, setAssignments] = useState<WanikaniAssignment[]>([]);
    const [reviews, setReviews] = useState<WanikaniReview[]>([]);
    const [summary, setSummary] = useState<WanikaniSummary>();
    const [resets, setResets] = useState<Loadable<WanikaniReset[]>>({
        isLoaded: false,
        data: []
    });

    const [reviewsProgress, setReviewsProgress] = useState<number>(0.0);
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

        if (config.user) {
            WanikaniApiService.getUser()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setUser(data);
                });
        }

        if (config.summary) {
            WanikaniApiService.getSummary()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setSummary(data);
                });
        }

        if (config.subjects) {
            WanikaniApiService.getSubjects()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setSubjects(data);
                });
        }

        if (config.levelProgress) {
            WanikaniApiService.getLevelProgress()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setLevelProgress(data);
                });
        }

        if (config.resets) {
            WanikaniApiService.getResets()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setResets({
                        isLoaded: true,
                        data: data
                    });
                });
        }

        if (config.assignments) {
            WanikaniApiService.getAllAssignments()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setAssignments(data);
                });
        }

        if (config.reviews) {
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