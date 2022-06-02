import {RawWanikaniPage} from "./RawWanikaniPage";

export interface RawWanikaniReviewPage {
    object: string
    url: string
    pages: RawWanikaniPage
    total_count: number
    data_updated_at: string
    data: RawWanikaniReview[]
}

export interface RawWanikaniReview {
    id: number
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniReviewData
}

export interface RawWanikaniReviewData {
    created_at: string
    assignment_id: number
    spaced_repetition_system_id: number
    subject_id: number
    starting_srs_stage: number
    ending_srs_stage: number
    incorrect_meaning_answers: number
    incorrect_reading_answers: number
}
