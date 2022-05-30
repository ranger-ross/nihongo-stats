import {RawWanikaniPage} from "./RawWanikaniPage";

export interface RawWanikaniResetPage {
    object: string
    url: string
    pages: RawWanikaniPage
    total_count: number
    data_updated_at: string
    data: RawWanikaniReset[]
}

export interface RawWanikaniReset {
    id: number
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniResetData
}

export interface RawWanikaniResetData {
    created_at: string
    original_level: number
    target_level: number
    confirmed_at: string
}
