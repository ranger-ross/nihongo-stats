export interface BunProReview {
    id: number
    userId: number
    studyQuestionId: number
    grammarPointId: number
    timesCorrect: number
    timesIncorrect: number
    streak: number
    nextReview: Date | null
    createdAt: Date
    updatedAt: Date | null
    readings: number[]
    complete: boolean
    lastStudiedAt: Date | null
    wasCorrect: boolean
    selfStudy: boolean
    reviewMisses: number
    history: BunProReviewHistory[]
    missedQuestionIds: number[]
    studiedQuestionIds: number[]
    reviewType: string
    maxStreak: number
    startedStudyingAt: Date | null
    reviewableType: string
    reviewableId: number,
    defaultInputType: string,
    userSynonyms: string
}

export interface BunProReviewHistory {
    id: number
    time: Date
    status: boolean
    attempts: number
    streak: number
}
