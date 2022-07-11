export interface WanikaniSubject {
    id: number
    url: string
    object: string
    dataUpdatedAt: Date
    amalgamationSubjectIds: number[]
    auxiliaryMeanings: WanikaniSubjectAuxiliaryMeaning[]
    characters: string
    characterImages: WanikaniSubjectCharacterImage[] // radicals only
    createdAt: Date
    documentUrl: string
    hiddenAt: Date | null
    lessonPosition: number
    level: number
    meanings: WanikaniSubjectMeaning[]
    readings: WanikaniSubjectReading[]
    meaningMnemonic: string
    slug: string
    spacedRepetitionSystemId: number
    componentSubjectIds?: number[] // kanji only
    visuallySimilarSubjectIds?: number[] // kanji only
    readingHint?: string;
    meaningHint?: string;
    readingMnemonic?: string;
}

export interface WanikaniSubjectAuxiliaryMeaning {
    meaning: string
    type: string
}

export interface WanikaniSubjectCharacterImage {
    url: string
    metadata: WanikaniSubjectMetadata
    contentType: string
}

export interface WanikaniSubjectMetadata {
    inlineStyles: boolean
}

export interface WanikaniSubjectMeaning {
    meaning: string
    primary: boolean
    acceptedAnswer: boolean
}

export interface WanikaniSubjectReading {
    type: string,
    primary: boolean,
    acceptedAnswer: boolean,
    reading: string
}
