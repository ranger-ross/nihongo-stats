export interface RawWanikaniReviewStatistic {
    data: {
        subject_id: number
        subject_type: string
        meaning_correct: number
        meaning_incorrect: number
        reading_correct: number
        reading_incorrect: number
    }
}
