import {RawWanikaniPage} from "./RawWanikaniPage";

export interface RawWanikaniCollectionResponse<T> {
    object: 'collection'
    url: string
    data_updated_at: string
    total_count: number
    pages: RawWanikaniPage
    data: T[]
}
