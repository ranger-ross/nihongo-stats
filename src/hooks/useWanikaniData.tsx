import {
    useWanikaniAssignments,
    useWanikaniLevelProgress,
    useWanikaniResets,
    useWanikaniReviewStatistics,
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
    reviewStatistics?: boolean
    resets?: boolean
};

export function useWanikaniData(config: WanikaniDataConfig) {
    const {data: user, isLoading: isUserLoading} = useWanikaniUser(config.user)
    const {data: subjects, isLoading: isSubjectsLoading} = useWanikaniSubjects(config.subjects)
    const {data: assignments, isLoading: isAssignmentsLoading} = useWanikaniAssignments(config.assignments)
    const {data: summary, isLoading: isSummaryLoading} = useWanikaniSummary(config.summary)
    const {data: levelProgress, isLoading: isLevelProgressLoading} = useWanikaniLevelProgress(config.levelProgress)
    const {data: resets, isLoading: isResetsLoading} = useWanikaniResets(config.resets)
    const {data: reviewStatistics, isLoading: isReviewStatisticsLoading} = useWanikaniReviewStatistics(config.reviewStatistics)

    const isLoading =
        (config.user && !user && isUserLoading) ||
        (config.summary && !summary && isSummaryLoading) ||
        (config.resets && !resets && isResetsLoading) ||
        (config.levelProgress && !levelProgress && isLevelProgressLoading) ||
        (config.subjects && !subjects && isSubjectsLoading) ||
        (config.reviewStatistics && !reviewStatistics && isReviewStatisticsLoading) ||
        (config.assignments && isAssignmentsLoading);

    return {
        user,
        subjects: subjects ?? [],
        levelProgress: levelProgress ?? [],
        assignments: assignments ?? [],
        reviewStatistics: reviewStatistics ?? [],
        isLoading,
        summary,
        resets: resets ?? []
    }
}
