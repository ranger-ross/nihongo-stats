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

    const {data: user, isFetching: isUserFetching} = useWanikaniUser(config.user)
    const {data: subjects, isFetching: isSubjectsFetching} = useWanikaniSubjects(config.subjects)
    const {data: assignments, isFetching: isAssignmentsFetching} = useWanikaniAssignments(config.assignments)
    const {data: summary, isFetching: isSummaryFetching} = useWanikaniSummary(config.summary)
    const {data: levelProgress, isFetching: isLevelProgressFetching} = useWanikaniLevelProgress(config.levelProgress)
    const {data: resets, isFetching: isResetsFetching} = useWanikaniResets(config.resets)
    const {data: reviews, isFetching: isReviewsFetching} = useWanikaniReviews(
        config.reviews,
        setReviewsProgress,
        setReviewsIsRateLimited
    );

    const isFetching =
        (config.user && !user && isUserFetching) ||
        (config.summary && !summary && isSummaryFetching) ||
        (config.resets && !resets && isResetsFetching) ||
        (config.levelProgress && !levelProgress && isLevelProgressFetching) ||
        (config.subjects && !subjects && isSubjectsFetching) ||
        (config.reviews && !reviews && isReviewsFetching) ||
        (config.assignments && isAssignmentsFetching);

    return {
        user,
        subjects: subjects ?? [],
        levelProgress: levelProgress ?? [],
        assignments: assignments ?? [],
        reviews: reviews ?? [],
        isFetching,
        summary,
        reviewsProgress,
        reviewsIsRateLimited,
        resets: resets ?? []
    }
}
