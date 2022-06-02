export interface RawBunProUser {
    data: RawBunProUserData
}

export type RawBunProUserData = {
    id: string,
    type: string,
    attributes: {
        "email": string,
        "username": string,
        "created-at": string,
        "updated-at": string,
        "hide-english": string,
        "furigana": string,
        "light-mode": string,
        "batch-size": number,
        "study-level": string,
        "vacation-mode": false,
        "language": null,
        "bunny-mode": string,
        "review-english": string,
        "wanikani-api-key": string,
        "known-kanji": { [key: string]: string },
        "font-sizing": string,
        "new-notifications": false,
        "level": number,
        "xp": number,
        "prev-level-xp": number,
        "next-level-xp": number,
        "study-streak": number,
        "name": string,
        "receive-language-learning-newsletter": string,
        "receive-progress-emails": string,
        "receive-inactivity-emails": string,
        "opt-in-to-beta": string,
        "forecast-data-view": string,
        "mobile-nav-location": string,
        "enable-color-blind-assistance": string,
        "allow-feedback-reply-emails": true,
        "casual-formal-focus": string,
        "split-reviews": string,
        "listening-mode": string,
        "auto-play-review-audio": string,
        "ghost-review-settings": string,
        "primary-textbook": string,
        "unsubscribe-from-email": string,
        "time-zone": string
    }
}
