import {RawWanikaniPage} from "./RawWanikaniPage";

export interface RawWanikaniSrsSystemPage {
    object: string
    url: string
    pages: RawWanikaniPage
    total_count: number
    data_updated_at: string
    data: RawWanikaniSrsSystem[]
}

export interface RawWanikaniSrsSystem {
    id: number
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniSrsSystemData
}

export interface RawWanikaniSrsSystemData {
    created_at: string
    name: string
    description: string
    unlocking_stage_position: number
    starting_stage_position: number
    passing_stage_position: number
    burning_stage_position: number
    stages: RawWanikaniSrsSystemStage[]
}

export interface RawWanikaniSrsSystemStage {
    interval?: number
    position: number
    interval_unit?: string
}

