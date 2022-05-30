export interface RawWanikaniUser {
    object: string
    url: string
    data_updated_at: string
    data: RawWanikaniUserData
}

export interface RawWanikaniUserData {
    id: string
    username: string
    level: number
    profile_url: string
    started_at: string
    current_vacation_started_at: string
    subscription: RawWanikaniSubscription
    preferences: RawWanikaniPreferences
}

export interface RawWanikaniSubscription {
    active: boolean
    type: string
    max_level_granted: number
    period_ends_at: string
}

export interface RawWanikaniPreferences {
    default_voice_actor_id: number
    lessons_autoplay_audio: boolean
    lessons_batch_size: number
    lessons_presentation_order: string
    reviews_autoplay_audio: boolean
    reviews_display_srs_indicator: boolean
}
