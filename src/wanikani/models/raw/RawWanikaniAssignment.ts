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
    started_at: string
    passed_at: string
    burned_at: string
    available_at: string
    resurrected_at: string
}
