import {WanikaniPage} from "./WanikaniPage";

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


export interface WanikaniReviewPage {
    url: string
    pages: WanikaniPage
    totalCount: number
    dataUpdatedAt: Date
    data: WanikaniReview[]
}