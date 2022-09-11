import BunProApiService from "./BunProApiService";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import {BunProReview} from "../models/BunProReview";

export type BunProGrammarPointLookupMap = { [id: string]: BunProGrammarPoint }

export function createGrammarPointsLookupMap(grammarPoints: BunProGrammarPoint[]): BunProGrammarPointLookupMap {
    const map: BunProGrammarPointLookupMap = {};
    for (const grammarPoint of grammarPoints) {
        map[grammarPoint.id] = grammarPoint;
    }
    return map;
}

export type BunProFlattenedReview = BunProReview & {
    current: {
        id: number
        status: boolean
        attempts: number
        streak: number
        time: Date
    }
}

export function flattenReview(review: BunProReview): BunProFlattenedReview[] {
    const data: BunProFlattenedReview[] = [];

    for (const history of review.history) {
        data.push({
            ...review,
            current: {
                ...history,
                time: history.time
            }
        })
    }

    return data;
}

export type BunProFlattenedReviewWithLevel = BunProFlattenedReview & {
    level: string
};

/**
 * @deprecated use flattenBunProReviews instead.
 */
export async function fetchAllBunProReviews(grammarPoints: BunProGrammarPoint[] | null = null): Promise<BunProFlattenedReviewWithLevel[]> {
    const needToFetchGrammarPoints = !grammarPoints;

    let reviewsData;
    if (needToFetchGrammarPoints) {
        const data = await Promise.all([
            BunProApiService.getAllReviews(),
            BunProApiService.getGrammarPoints()
        ]);

        reviewsData = data[0];
        grammarPoints = data[1];
    } else {
        reviewsData = await BunProApiService.getAllReviews();
    }

    const grammarPointsLookupMap = createGrammarPointsLookupMap(grammarPoints as BunProGrammarPoint[]);

    const reviews: BunProFlattenedReviewWithLevel[] = [];

    for (const review of reviewsData.reviews) {
        const grammarPoint = grammarPointsLookupMap[review.grammarPointId];
        for (const flatReview of flattenReview(review)) {
            reviews.push({
                ...flatReview,
                level: grammarPoint.level.replace('JLPT', 'N')
            });
        }
    }

    return reviews;
}


export function flattenBunProReviews(grammarPoints?: BunProGrammarPoint[], reviewsData?: BunProReview[]): BunProFlattenedReviewWithLevel[] | undefined {
    if (!grammarPoints || !reviewsData)
        return undefined;
    const grammarPointsLookupMap = createGrammarPointsLookupMap(grammarPoints as BunProGrammarPoint[]);

    const reviews: BunProFlattenedReviewWithLevel[] = [];

    for (const review of reviewsData) {
        const grammarPoint = grammarPointsLookupMap[review.grammarPointId];
        for (const flatReview of flattenReview(review)) {
            reviews.push({
                ...flatReview,
                level: grammarPoint.level.replace('JLPT', 'N')
            });
        }
    }

    return reviews;
}


export function filterDeadGhostReviews(review: BunProReview) {
    const fiveYearsFromNow = Date.now() + (1000 * 60 * 60 * 24 * 365 * 5)
    return review.nextReview && review.nextReview.getTime() < fiveYearsFromNow;
}
