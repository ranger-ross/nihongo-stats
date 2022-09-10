import {BunProReview} from "../service/BunProReview";

export interface BunProReviewsResponse {
    ghostReviews: BunProReview[], // TODO: Create dedicated GhostReview type since it has less fields
    reviews: BunProReview[],
    selfStudyReviews: BunProReview[], // TODO: Determine correct datatype
}
