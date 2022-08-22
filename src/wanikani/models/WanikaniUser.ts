export interface WanikaniUser {
    id: string
    username: string
    level: number
    profileUrl: string
    startedAt: Date
    currentVacationStartedAt: Date | null
    subscription: WanikaniSubscription
    preferences: WanikaniPreferences
}

export interface WanikaniSubscription {
    active: boolean
    type: string
    maxLevelGranted: number
    periodEndsAt: Date | null
}

export interface WanikaniPreferences {
    defaultVoiceActorId: number
    lessonsAutoplayAudio: boolean
    lessonsBatchSize: number
    lessonsPresentationOrder: string
    reviewsAutoplayAudio: boolean
    reviewsDisplaySrsIndicator: boolean
    extraStudyAutoplayAudio: boolean
    wanikaniCompatibilityMode: boolean
    reviewsPresentationOrder: string
}
