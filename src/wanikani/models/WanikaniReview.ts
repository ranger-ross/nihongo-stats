export interface WanikaniReview {
    id: number
    url: string
    dataUpdatedAt: Date
    createdAt: Date
    assignmentId: number
    spacedRepetitionSystemId: number
    subjectId: number
    startingSrsStage: number
    endingSrsStage: number
    incorrectMeaningAnswers: number
    incorrectReadingAnswers: number
}
