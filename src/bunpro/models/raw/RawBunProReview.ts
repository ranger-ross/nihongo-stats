export interface RawBunProReview {
    id: number
    user_id: number
    study_question_id: number
    grammar_point_id: number
    times_correct: number
    times_incorrect: number
    streak: number
    next_review: string
    created_at: string
    updated_at: string
    readings: number[]
    complete: boolean
    last_studied_at: string
    was_correct: boolean
    self_study: boolean
    review_misses: number
    history: RawBunProReviewHistory[]
    missed_question_ids: number[]
    studied_question_ids: number[]
    review_type: string,
    max_streak: number
    started_studying_at: string | null
    reviewable_type: string
    reviewable_id: number,
    default_input_type: string,
    user_synonyms: string
}

export interface RawBunProReviewHistory {
    id: number
    time: string
    status: boolean
    attempts: number
    streak: number
}
