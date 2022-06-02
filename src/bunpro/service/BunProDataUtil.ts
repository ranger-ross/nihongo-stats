import BunProApiService from "./BunProApiService";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {RawBunProReview} from "../models/raw/RawBunProReview";

export function createGrammarPointsLookupMap(grammarPoints: RawBunProGrammarPoint[]) {
    const map: { [id: string]: RawBunProGrammarPoint } = {};
    for (const grammarPoint of grammarPoints) {
        map[grammarPoint.id] = grammarPoint;
    }
    return map;
}

export function flattenReview(review: RawBunProReview) {
    const data = [];

    for (const history of review.history) {
        data.push({
            ...review,
            current: {
                ...history,
                time: new Date(history.time)
            }
        })
    }

    return data;
}

export async function fetchAllBunProReviews(grammarPoints: RawBunProGrammarPoint[] | null = null) {
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

    const reviews = [];

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