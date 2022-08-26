export interface WanikaniSummary {
    url: string
    dataUpdatedAt: Date
    lessons: WanikaniSummaryLesson[]
    nextReviewsAt: Date | null
    reviews: WanikaniSummaryReview[]
}

export interface WanikaniSummaryLesson {
    availableAt: Date
    subjectIds: number[]
}

export interface WanikaniSummaryReview {
    availableAt: Date
    subjectIds: number[]
}

