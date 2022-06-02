import {RawWanikaniPage} from "./RawWanikaniPage";

export interface RawWanikaniLevelProgressionPage {
    object: string
    url: string
    pages: RawWanikaniPage
    total_count: number
    data_updated_at: string
    data: RawWanikaniLevelProgression[]
}

export interface RawWanikaniLevelProgression {
    id: number
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniLevelProgressionData
}

export interface RawWanikaniLevelProgressionData {
    created_at: string
    level: number
    unlocked_at: string
    started_at: string
    passed_at: any
    completed_at: any
    abandoned_at: any
}
