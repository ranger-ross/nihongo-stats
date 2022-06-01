export interface AnkiCardField {
    order: number
    value: string
}

export interface AnkiCard {
    answer: string,
    cardId: number,
    css: string,
    deckName: string,
    due: number,
    factor: number,
    fieldOrder: number,
    fields: { [field: string]: AnkiCardField }
    interval: number,
    lapses: number,
    left: number,
    mod: number,
    modelName: string,
    note: number,
    ord: number,
    question: string,
    queue: number,
    reps: number,
    type: number,
}
