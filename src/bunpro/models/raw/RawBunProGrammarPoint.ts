export interface RawBunProGrammarPoint {
    id: string
    type: string
    attributes: RawBunProGrammarPointAttibutes
}

export interface RawBunProGrammarPointAttibutes {
    title: string
    yomikata: string
    meaning: string
    caution: string
    structure: string
    level: string
    "lesson-id": number
    nuance: string
    incomplete: boolean
    "grammar-order": number
}
