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
    const {data: user} = useBunProUser(config.user);
    const {data: grammarPoints} = useBunProGrammarPoints(config.grammarPoints);
    const {data: reviews} = useBunProReviews(config.reviews);
    const {data: pendingReviews} = useBunProPendingReviews(config.reviews);

    return {
        user: user,
        grammarPoints: grammarPoints,
        reviewData: reviews,
        pendingReviewsCount: pendingReviews?.length ?? 0
    }
}
