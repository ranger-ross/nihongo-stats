export interface RawWanikaniSubject {
    id: number
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniSubjectData
}

export interface RawWanikaniSubjectData {
    amalgamation_subject_ids: number[]
    auxiliary_meanings: RawWanikaniSubjectAuxiliaryMeaning[]
    characters: string
    character_images: RawWanikaniSubjectCharacterImage[]
    created_at: string
    document_url: string
    hidden_at: any
    lesson_position: number
    level: number
    meanings: RawWanikaniSubjectMeaning[]
    meaning_mnemonic: string
    slug: string
    spaced_repetition_system_id: number
}

export interface RawWanikaniSubjectAuxiliaryMeaning {
    meaning: string
    type: string
}

export interface RawWanikaniSubjectCharacterImage {
    url: string
    metadata: RawWanikaniSubjectMetadata
    content_type: string
}

export interface RawWanikaniSubjectMetadata {
    inline_styles: boolean
}

export interface RawWanikaniSubjectMeaning {
    meaning: string
    primary: boolean
    accepted_answer: boolean
}
