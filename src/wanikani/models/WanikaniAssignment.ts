import {WanikaniSubjectType} from "./WanikaniSubject";

export interface WanikaniAssignment {
    id: number
    url: string
    dataUpdatedAt: Date
    createdAt: Date
    subjectId: number
    subjectType: WanikaniSubjectType
    srsStage: number
    unlockedAt: Date | null
    startedAt: Date | null
    passedAt: Date | null
    burnedAt: Date | null
    availableAt: Date | null
    resurrectedAt: Date | null
    hidden: boolean
}
