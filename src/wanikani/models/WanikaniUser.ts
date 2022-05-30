export interface WanikaniUser {
    id: string
    username: string
    level: number
    profileUrl: string
    startedAt: string
    currentVacationStartedAt: string
    subscription: RawWanikaniSubscription
    preferences: RawWanikaniPreferences
}

export interface RawWanikaniSubscription {
    active: boolean
    type: string
    maxLevelGranted: number
    periodEndsAt: string
}

export interface RawWanikaniPreferences {
    defaultVoiceActorId: number
    lessonsAutoplayAudio: boolean
    lessonsBatchSize: number
    lessonsPresentationOrder: string
    reviewsAutoplayAudio: boolean
    reviewsDisplaySrsIndicator: boolean
}
