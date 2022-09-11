import {
    useBunProGrammarPoints,
    useBunProPendingReviews,
    useBunProReviews,
    useBunProUser
} from "../bunpro/service/BunProQueries";

type BunProDataConfig = {
    user?: boolean,
    grammarPoints?: boolean
    reviews?: boolean,
    pendingReviews?: boolean,
};

export function useBunProData(config: BunProDataConfig) {
    const {data: user, isLoading: isUserLoading} = useBunProUser(config.user);
    const {data: grammarPoints, isLoading: isGrammarPointsLoading} = useBunProGrammarPoints(config.grammarPoints);
    const {data: reviews, isLoading: isReviewsLoading} = useBunProReviews(config.reviews);
    const {data: pendingReviews, isLoading: isPendingReviewsLoading} = useBunProPendingReviews(config.reviews);

    const isLoading =
        (config.user && isUserLoading) ||
        (config.grammarPoints && isGrammarPointsLoading) ||
        (config.reviews && isReviewsLoading) ||
        (config.pendingReviews && isPendingReviewsLoading);

    return {
        isLoading,
        user: user,
        grammarPoints: grammarPoints,
        reviewData: reviews,
        pendingReviewsCount: (pendingReviews?.length ?? 0) as number
    }
}
