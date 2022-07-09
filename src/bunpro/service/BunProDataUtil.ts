import BunProApiService from "./BunProApiService";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {RawBunProReview} from "../models/raw/RawBunProReview";

export type RawBunProGrammarPointLookupMap = { [id: string]: RawBunProGrammarPoint }

export function createGrammarPointsLookupMap(grammarPoints: RawBunProGrammarPoint[]): RawBunProGrammarPointLookupMap {
    const map: RawBunProGrammarPointLookupMap = {};
    for (const grammarPoint of grammarPoints) {
        map[grammarPoint.id] = grammarPoint;
    }
    return map;
}

export type RawBunProFlattenedReview = RawBunProReview & {
    current: {
        id: number
        status: boolean
        attempts: number
        streak: number
        time: Date
    }
}

// Needed because Safari new Date() with dashes does not work
function formatDate(time: string) {
    return new Date(time.replace(/-/g, "/"));
}

export function flattenReview(review: RawBunProReview): RawBunProFlattenedReview[] {
    const data: RawBunProFlattenedReview[] = [];

    for (const history of review.history) {
        data.push({
            ...review,
            current: {
                ...history,
                time: formatDate(history.time)
            }
        })
    }

    return data;
}

export type RawBunProFlattenedReviewWithLevel = RawBunProFlattenedReview & {
    level: string
};

export async function fetchAllBunProReviews(grammarPoints: RawBunProGrammarPoint[] | null = null): Promise<RawBunProFlattenedReviewWithLevel[]> {
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

    const grammarPointsLookupMap = createGrammarPointsLookupMap(grammarPoints as RawBunProGrammarPoint[]);

    const reviews: RawBunProFlattenedReviewWithLevel[] = [];

    for (const review of reviewsData.reviews) {
        const grammarPoint = grammarPointsLookupMap[review['grammar_point_id']];
        for (const flatReview of flattenReview(review)) {
            reviews.push({
                ...flatReview,
                level: grammarPoint.attributes.level.replace('JLPT', 'N')
            });
        }
    }

    return reviews;
}

export function filterDeadGhostReviews(review: RawBunProReview) {
    const fiveYearsFromNow = Date.now() + (1000 * 60 * 60 * 24 * 365 * 5)
    return new Date(review['next_review']).getTime() < fiveYearsFromNow;
}
