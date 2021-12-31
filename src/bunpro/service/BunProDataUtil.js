import BunProApiService from "./BunProApiService.js";

export function createGrammarPointsLookupMap(grammarPoints) {
    let map = {};
    for (const grammarPoint of grammarPoints) {
        map[grammarPoint.id] = grammarPoint;
    }
    return map;
}

export function flattenReview(review) {
    let data = [];

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

export async function fetchAllBunProReviews(grammarPoints = null) {
    let needToFetchGrammarPoints = !grammarPoints;

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

    const grammarPointsLookupMap = createGrammarPointsLookupMap(grammarPoints);

    let reviews = [];

    for (const review of reviewsData.reviews) {
        const grammarPoint = grammarPointsLookupMap[review['grammar_point_id']];
        review.level = grammarPoint.level.replace('JLPT', 'N');
        reviews.push(...flattenReview(review));
    }

    return reviews;
}