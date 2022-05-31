import {RawBunProReview} from "./RawBunProReview";

export interface RawBunProReviewsResponse {
    ghost_reviews: RawBunProReview[], // TODO: Create dedicated GhostReview type since it has less fields
    reviews: RawBunProReview[],
    self_study_reviews: RawBunProReview[], // TODO: Determine correct datatype
}
