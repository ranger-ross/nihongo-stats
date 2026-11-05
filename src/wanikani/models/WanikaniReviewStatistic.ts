import {WanikaniSubjectType} from "./WanikaniSubject";

export interface WanikaniReviewStatistic {
    subjectId: number
    subjectType: WanikaniSubjectType
    meaningCorrect: number
    meaningIncorrect: number
    readingCorrect: number
    readingIncorrect: number
}
