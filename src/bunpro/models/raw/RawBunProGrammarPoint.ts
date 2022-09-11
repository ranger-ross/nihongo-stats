export interface RawBunProGrammarPoint {
    id: string
    type: string
    attributes: RawBunProGrammarPointAttributes
}

export interface RawBunProGrammarPointAttributes {
    title: string
    yomikata: string
    meaning: string
    caution: string | null
    structure: string
    level: string
    "lesson-id": number
    nuance: string
    incomplete?: boolean
    "grammar-order": number,
    "discourse-link": string | null,
    "formal": boolean,
    "metadata": string,
    "polite-structure": string,
    "casual-structure": string,
    "part-of-speech": string,
    "register": string,
    "word-type": string,
    "slug": string,
    "created-at": string,
    "updated-at": string,
}
