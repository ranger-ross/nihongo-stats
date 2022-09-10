export interface BunProGrammarPoint {
    id: string
    createdAt: Date,
    updatedAt: Date | null,
    title: string
    yomikata: string
    meaning: string
    caution: string | null
    structure: string
    level: string
    lessonId: number
    nuance: string
    incomplete?: boolean
    grammarOrder: number,
    discourseLink: string | null,
    formal: boolean,
    metadata: string,
    slug: string,
    politeStructure: string,
    casualStructure: string,
    partOfSpeech: string,
    register: string,
    wordType: string,
}
