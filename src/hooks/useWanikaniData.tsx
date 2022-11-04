import {useState} from "react";
import {
    useWanikaniAssignments,
    useWanikaniLevelProgress,
    useWanikaniResets,
    useWanikaniReviews,
    useWanikaniSubjects,
    useWanikaniSummary,
    useWanikaniUser
} from "../wanikani/service/WanikaniQueries";

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

    const [reviewsProgress, setReviewsProgress] = useState<number>(-1.0);
    const [reviewsIsRateLimited, setReviewsIsRateLimited] = useState(false);

    const {data: user, isLoading: isUserLoading} = useWanikaniUser(config.user)
    const {data: subjects, isLoading: isSubjectsLoading} = useWanikaniSubjects(config.subjects)
    const {data: assignments, isLoading: isAssignmentsLoading} = useWanikaniAssignments(config.assignments)
    const {data: summary, isLoading: isSummaryLoading} = useWanikaniSummary(config.summary)
    const {data: levelProgress, isLoading: isLevelProgressLoading} = useWanikaniLevelProgress(config.levelProgress)
    const {data: resets, isLoading: isResetsLoading} = useWanikaniResets(config.resets)
    const {data: reviews, isLoading: isReviewsLoading} = useWanikaniReviews(
        config.reviews,
        setReviewsProgress,
        setReviewsIsRateLimited
    );

    const isLoading =
        (config.user && !user && isUserLoading) ||
        (config.summary && !summary && isSummaryLoading) ||
        (config.resets && !resets && isResetsLoading) ||
        (config.levelProgress && !levelProgress && isLevelProgressLoading) ||
        (config.subjects && !subjects && isSubjectsLoading) ||
        (config.reviews && !reviews && isReviewsLoading) ||
        (config.assignments && isAssignmentsLoading);

    return {
        user,
        subjects: subjects ?? [],
        levelProgress: levelProgress ?? [],
        assignments: assignments ?? [],
        reviews: reviews ?? [],
        isLoading,
        summary,
        reviewsProgress,
        reviewsIsRateLimited,
        resets: resets ?? []
    }
}
