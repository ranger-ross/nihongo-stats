import {RawWanikaniUser} from "../models/raw/RawWanikaniUser";
import {WanikaniUser} from "../models/WanikaniUser";
import {RawWanikaniReset} from "../models/raw/RawWanikaniReset";
import {WanikaniReset} from "../models/WanikaniReset";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapWanikaniUser(rawUser: RawWanikaniUser): WanikaniUser {
    return {
        id: rawUser.data.id,
        startedAt: rawUser.data.started_at,
        level: rawUser.data.level,
        currentVacationStartedAt: rawUser.data.current_vacation_started_at,
        profileUrl: rawUser.data.profile_url,
        username: rawUser.data.username,
        subscription: {
            type: rawUser.data.subscription.type,
            active: rawUser.data.subscription.active,
            maxLevelGranted: rawUser.data.subscription.max_level_granted,
            periodEndsAt: rawUser.data.subscription.period_ends_at,
        },
        preferences: {
            lessonsPresentationOrder: rawUser.data.preferences.lessons_presentation_order,
            defaultVoiceActorId: rawUser.data.preferences.default_voice_actor_id,
            lessonsAutoplayAudio: rawUser.data.preferences.lessons_autoplay_audio,
            lessonsBatchSize: rawUser.data.preferences.lessons_batch_size,
            reviewsAutoplayAudio: rawUser.data.preferences.reviews_autoplay_audio,
            reviewsDisplaySrsIndicator: rawUser.data.preferences.reviews_display_srs_indicator,
        },
    };
}


export function mapWanikaniReset(rawReset: RawWanikaniReset): WanikaniReset {
    return <WanikaniReset>{
        originalLevel: rawReset.data.original_level,
        targetLevel: rawReset.data.target_level,
        confirmedAt: rawReset.data.confirmed_at ? new Date(rawReset.data.confirmed_at) : null,
        createdAt: rawReset.data.created_at ? new Date(rawReset.data.created_at) : null
    };
}
