import {RawWanikaniPage} from "./RawWanikaniPage";

export interface RawWanikaniAssignmentPage {
    object: string
    url: string
    pages: RawWanikaniPage
    total_count: number
    data_updated_at: string
    data: RawWanikaniAssignment[]
}

export interface RawWanikaniAssignment {
    id: number
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniAssignmentData
}

export interface RawWanikaniAssignmentData {
    created_at: string
    subject_id: number
    subject_type: string
    srs_stage: number
    unlocked_at: string
    started_at: string | null
    passed_at: string | null
    burned_at: string | null
    available_at: string | null
    resurrected_at: string | null
    hidden: boolean
}
