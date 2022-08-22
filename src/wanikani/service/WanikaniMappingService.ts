import {RawWanikaniUser} from "../models/raw/RawWanikaniUser";
import {WanikaniUser} from "../models/WanikaniUser";
import {RawWanikaniReset} from "../models/raw/RawWanikaniReset";
import {WanikaniReset} from "../models/WanikaniReset";
import {
    RawWanikaniSubject,
    RawWanikaniSubjectCharacterImage, RawWanikaniSubjectMeaning,
    RawWanikaniSubjectMetadata, RawWanikaniSubjectReading
} from "../models/raw/RawWanikaniSubject";
import {
    WanikaniSubject,
    WanikaniSubjectCharacterImage,
    WanikaniSubjectMeaning,
    WanikaniSubjectMetadata, WanikaniSubjectReading, WanikaniSubjectType
} from "../models/WanikaniSubject";

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

export function mapWanikaniSubject(rawSubject: RawWanikaniSubject): WanikaniSubject {
    const hiddenAt = !!rawSubject.data.hidden_at ? new Date(rawSubject.data.hidden_at) : null;

    return {
        object: rawSubject.object as WanikaniSubjectType,
        amalgamationSubjectIds: rawSubject.data.amalgamation_subject_ids,
        auxiliaryMeanings: rawSubject.data.auxiliary_meanings,
        characterImages: rawSubject.data.character_images?.map(mapSubjectCharacterImage) ?? [],
        characters: rawSubject.data.characters,
        createdAt: new Date(rawSubject.data.created_at),
        dataUpdatedAt: new Date(rawSubject.data_updated_at),
        documentUrl: rawSubject.data.document_url,
        hiddenAt: hiddenAt,
        id: rawSubject.id,
        lessonPosition: rawSubject.data.lesson_position,
        level: rawSubject.data.level,
        meaningMnemonic: rawSubject.data.meaning_mnemonic,
        meanings: rawSubject.data.meanings.map(mapSubjectMeaning),
        readings: rawSubject.data.readings?.map(mapSubjectReading) ?? [],
        slug: rawSubject.data.slug,
        spacedRepetitionSystemId: rawSubject.data.spaced_repetition_system_id,
        url: rawSubject.url,
        readingHint: rawSubject.data.reading_hint,
        meaningHint: rawSubject.data.meaning_hint,
        readingMnemonic: rawSubject.data.reading_mnemonic,
        componentSubjectIds: rawSubject.data.component_subject_ids,
        visuallySimilarSubjectIds: rawSubject.data.visually_similar_subject_ids,
    };
}

function mapSubjectReading(reading: RawWanikaniSubjectReading): WanikaniSubjectReading {
    return {
        acceptedAnswer: reading.accepted_answer,
        primary: reading.primary,
        reading: reading.reading,
        type: reading.type
    };
}

function mapSubjectMeaning(meaning: RawWanikaniSubjectMeaning): WanikaniSubjectMeaning {
    return {
        acceptedAnswer: meaning.accepted_answer,
        meaning: meaning.meaning,
        primary: meaning.primary
    }
}

function mapSubjectCharacterImage(image: RawWanikaniSubjectCharacterImage): WanikaniSubjectCharacterImage {
    return {
        contentType: image.content_type,
        metadata: mapSubjectMetadata(image.metadata),
        url: image.url,
    };
}

function mapSubjectMetadata(metadata: RawWanikaniSubjectMetadata): WanikaniSubjectMetadata {
    return {
        inlineStyles: metadata.inline_styles
    };
}
