export interface WanikaniLevelProgression {
    id: number
    url: string
    dataUpdatedAt: Date
    createdAt: Date
    level: number
    unlockedAt: Date | null
    startedAt: Date | null
    passedAt: Date | null
    completedAt: Date | null
    abandonedAt: Date | null
}

