import {BunProUser} from "../models/BunProUser";
import {RawBunProUser} from "../models/raw/RawBunProUser";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import {RawBunProReview, RawBunProReviewHistory} from "../models/raw/RawBunProReview";
import {BunProReview, BunProReviewHistory} from "./BunProReview";
import {RawBunProReviewsResponse} from "../models/raw/RawBunProReviewsResponse";
import {BunProReviewsResponse} from "../models/BunProReviewsResponse";

export function mapBunProUser(user: RawBunProUser): BunProUser {
    return {
        id: user.data.id,
        createdAt: new Date(user.data.attributes["created-at"]),
        updatedAt: new Date(user.data.attributes["updated-at"]),
        xp: user.data.attributes.xp,
        language: user.data.attributes.language,

        allowFeedbackReplyEmails: user.data.attributes["allow-feedback-reply-emails"],
        autoPlayReviewAudio: user.data.attributes["auto-play-review-audio"],
        batchSize: user.data.attributes["batch-size"],
        bunnyMode: user.data.attributes["bunny-mode"],
        casualFormalFocus: user.data.attributes["casual-formal-focus"],
        email: user.data.attributes.email,
        enableColorBlindAssistance: user.data.attributes["enable-color-blind-assistance"],
        fontSizing: user.data.attributes["font-sizing"],
        forecastDataView: user.data.attributes["forecast-data-view"],
        furigana: user.data.attributes.furigana,
        ghostReviewSettings: user.data.attributes["ghost-review-settings"],
        hideEnglish: user.data.attributes["hide-english"],
        knownKanji: user.data.attributes["known-kanji"],
        level: user.data.attributes.level,
        lightMode: user.data.attributes["light-mode"],
        listeningMode: user.data.attributes["listening-mode"],
        mobileNavLocation: user.data.attributes["mobile-nav-location"],
        name: user.data.attributes.name,
        newNotifications: user.data.attributes["new-notifications"],
        nextLevelXp: user.data.attributes["next-level-xp"],
        optInToBeta: user.data.attributes["opt-in-to-beta"],
        prevLevelXp: user.data.attributes["prev-level-xp"],
        primaryTextbook: user.data.attributes["primary-textbook"],
        receiveInactivityEmails: user.data.attributes["receive-inactivity-emails"],
        receiveLanguageLearningNewsletter: user.data.attributes["receive-language-learning-newsletter"],
        receiveProgressEmails: user.data.attributes["receive-progress-emails"],
        reviewEnglish: user.data.attributes["review-english"],
        splitReviews: user.data.attributes["split-reviews"],
        studyLevel: user.data.attributes["study-level"],
        studyStreak: user.data.attributes["study-streak"],
        timeZone: user.data.attributes["time-zone"],
        unsubscribeFromEmail: user.data.attributes["unsubscribe-from-email"],
        username: user.data.attributes.username,
        vacationMode: user.data.attributes["vacation-mode"],
        wanikaniApiKey: user.data.attributes["wanikani-api-key"],


    };
}

export function mapBunProGrammarPoint(gp: RawBunProGrammarPoint): BunProGrammarPoint {
    return {
        id: gp.id,
        caution: gp.attributes.caution,
        grammarOrder: gp.attributes["grammar-order"],
        incomplete: gp.attributes.incomplete,
        lessonId: gp.attributes["lesson-id"],
        level: gp.attributes.level,
        meaning: gp.attributes.meaning,
        nuance: gp.attributes.nuance,
        structure: gp.attributes.structure,
        title: gp.attributes.title,
        yomikata: gp.attributes.yomikata,
        casualStructure: gp.attributes["casual-structure"],
        createdAt: new Date(gp.attributes["created-at"]),
        updatedAt: gp.attributes["updated-at"] && gp.attributes["updated-at"].length > 0 ? new Date(gp.attributes["updated-at"]) : null,
        discourseLink: gp.attributes["discourse-link"],
        formal: gp.attributes.formal,
        metadata: gp.attributes.metadata,
        partOfSpeech: gp.attributes["part-of-speech"],
        politeStructure: gp.attributes["polite-structure"],
        register: gp.attributes.register,
        slug: gp.attributes.slug,
        wordType: gp.attributes["word-type"],
    };
}

export function mapBunProReview(review: RawBunProReview): BunProReview {
    return {
        id: review.id,
        createdAt: new Date(review.created_at),
        updatedAt: review.updated_at ? new Date(review.updated_at) : null,
        lastStudiedAt: review.last_studied_at ? new Date(review.last_studied_at) : null,
        nextReview: review.next_review ? new Date(review.next_review) : null,
        missedQuestionIds: review.missed_question_ids,
        studiedQuestionIds: review.studied_question_ids,
        readings: review.readings,
        reviewType: review.review_type,
        grammarPointId: review.grammar_point_id,
        reviewMisses: review.review_misses,
        complete: review.complete,
        streak: review.streak,
        studyQuestionId: review.study_question_id,
        timesCorrect: review.times_correct,
        timesIncorrect: review.times_incorrect,
        userId: review.user_id,
        selfStudy: review.self_study,
        wasCorrect: review.was_correct,
        history: review.history?.map(mapBunProReviewHistory) ?? [],
        defaultInputType: review.default_input_type,
        maxStreak: review.max_streak,
        reviewableId: review.reviewable_id,
        reviewableType: review.reviewable_type,
        startedStudyingAt: review.started_studying_at ? new Date(review.started_studying_at) : null,
        userSynonyms: review.user_synonyms
    };
}

function mapBunProReviewHistory(history: RawBunProReviewHistory): BunProReviewHistory {
    return {
        attempts: history.attempts,
        id: history.id,
        status: history.status,
        streak: history.streak,
        time: formatDate(history.time)
    };
}

// Needed because Safari new Date() with dashes does not work
function formatDate(time: string) {
    return new Date(time.replace(/-/g, "/"));
}


export function mapBunProReviewResponse(response: RawBunProReviewsResponse): BunProReviewsResponse {
    return {
        ghostReviews: response.ghost_reviews.map(mapBunProReview),
        reviews: response.reviews.map(mapBunProReview),
        selfStudyReviews: response.self_study_reviews.map(mapBunProReview),
    };
}



