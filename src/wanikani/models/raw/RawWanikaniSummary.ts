export interface RawWanikaniSummary {
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniSummaryData
}

export interface RawWanikaniSummaryData {
    lessons: RawWanikaniSummaryLesson[]
    next_reviews_at: string
    reviews: RawWanikaniSummaryReview[]
}

export interface RawWanikaniSummaryLesson {
    available_at: string
    subject_ids: number[]
}

export interface RawWanikaniSummaryReview {
    available_at: string
    subject_ids: number[]
}

