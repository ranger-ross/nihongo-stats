import {BunProUser} from "../models/BunProUser";
import {RawBunProUser} from "../models/raw/RawBunProUser";

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
