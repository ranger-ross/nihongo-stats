import {describe, expect, it} from "vitest";
import {RawBunProUser} from "../../models/raw/RawBunProUser";
import {mapBunProGrammarPoint, mapBunProUser} from "../BunProMappingService";
import {RawBunProGrammarPoint} from "../../models/raw/RawBunProGrammarPoint";


describe('BunProMappingService', () => {

    describe('mapBunProUser', () => {

        it('should map user properly', () => {

            const input: RawBunProUser = {
                data: {
                    "id": "11627",
                    "type": "users",
                    "attributes": {
                        "email": "dummy@mail.com",
                        "username": "Sully22",
                        "created-at": "2021-01-03T02:08:28Z",
                        "updated-at": "2022-09-10T05:26:59Z",
                        "hide-english": "No",
                        "furigana": "Wanikani",
                        "light-mode": "Modern Dark",
                        "batch-size": 3,
                        "study-level": "JLPT3",
                        "vacation-mode": false,
                        "language": null,
                        "bunny-mode": "Off",
                        "review-english": "Show",
                        "wanikani-api-key": "dummy",
                        "known-kanji": {
                            "菓": "known",
                            "多": "known"
                        },
                        "font-sizing": "16px",
                        "new-notifications": false,
                        "level": 66,
                        "xp": 294690,
                        "prev-level-xp": 287150,
                        "next-level-xp": 297800,
                        "study-streak": 596,
                        "name": null,
                        "receive-language-learning-newsletter": "No",
                        "receive-progress-emails": "No",
                        "receive-inactivity-emails": "No",
                        "opt-in-to-beta": "No",
                        "forecast-data-view": "Hourly",
                        "mobile-nav-location": "Left",
                        "enable-color-blind-assistance": "Off",
                        "allow-feedback-reply-emails": true,
                        "casual-formal-focus": "Casual",
                        "split-reviews": "No",
                        "listening-mode": "false",
                        "auto-play-review-audio": "On",
                        "ghost-review-settings": "Minimal",
                        "primary-textbook": "none",
                        "unsubscribe-from-email": "Yes",
                        "time-zone": "Tokyo"
                    }
                }
            }

            const result = mapBunProUser(input);

            expect(result.id).toBe('11627');
            expect(result.username).toBe('Sully22');
            expect(result.level).toBe(66);
            expect(result.email).toBe("dummy@mail.com");
            expect(result.createdAt.getTime()).toBe(1609639708000);
            expect(result.updatedAt.getTime()).toBe(1662787619000);
            expect(result.hideEnglish).toBe("No");
            expect(result.furigana).toBe("Wanikani");
            expect(result.lightMode).toBe("Modern Dark");
            expect(result.batchSize).toBe(3);
            expect(result.studyLevel).toBe("JLPT3");
            expect(result.vacationMode).toBe(false);
            expect(result.language).toBe(null);
            expect(result.bunnyMode).toBe("Off");
            expect(result.reviewEnglish).toBe("Show");
            expect(result.wanikaniApiKey).toBe("dummy");
            expect(result.fontSizing).toBe("16px");
            expect(result.newNotifications).toBe(false);
            expect(result.xp).toBe(294690);
            expect(result.prevLevelXp).toBe(287150);
            expect(result.nextLevelXp).toBe(297800);
            expect(result.studyStreak).toBe(596);
            expect(result.receiveLanguageLearningNewsletter).toBe("No");
            expect(result.receiveProgressEmails).toBe("No");
            expect(result.receiveInactivityEmails).toBe("No");
            expect(result.optInToBeta).toBe("No");
            expect(result.forecastDataView).toBe("Hourly");
            expect(result.mobileNavLocation).toBe("Left");
            expect(result.enableColorBlindAssistance).toBe("Off");
            expect(result.allowFeedbackReplyEmails).toBe(true);
            expect(result.casualFormalFocus).toBe("Casual");
            expect(result.splitReviews).toBe("No");
            expect(result.listeningMode).toBe("false");
            expect(result.autoPlayReviewAudio).toBe("On");
            expect(result.ghostReviewSettings).toBe("Minimal");
            expect(result.primaryTextbook).toBe("none");
            expect(result.unsubscribeFromEmail).toBe("Yes");
            expect(result.timeZone).toBe("Tokyo");

            expect(result.knownKanji).toBeDefined()
            expect(Object.getOwnPropertyNames(result.knownKanji).length).toBe(2)
            expect(result.knownKanji["菓"]).toBe("known");
            expect(result.knownKanji["多"]).toBe("known");

        });

    });

    describe('mapBunProGrammarPoint', () => {

        it('should map grammar point properly', () => {

            const input: RawBunProGrammarPoint = {
                "id": "212",
                "type": "grammar-points",
                "attributes": {
                    "title": "たらいい・といい",
                    "yomikata": "たらいい・といい",
                    "meaning": "it would be nice if, it would be good if, should・I hope",
                    "caution": null,
                    "discourse-link": "https://community.bunpro.jp/t/grammar-discussion/1208",
                    "formal": false,
                    "structure": "Verb[<strong>た</strong>] + <strong>ら</strong> + <strong>いい</strong>, Verb + <strong>と</strong> + <strong>いい</strong><br><br><a href='https://bunpro.jp/grammar_points/102' target='_blank'>たら Review</a>",
                    "level": "JLPT3",
                    "lesson-id": 21,
                    "nuance": "",
                    "grammar-order": 304,
                    "metadata": "taraii toii baii",
                    "polite-structure": "<span class='gp-popout' data-gp-id='102'>Verb［たら］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong> + <span class='gp-popout' data-gp-id='2'>です</span><br><span class='gp-popout' data-gp-id='154'>Verb［ば］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong> + <span class='gp-popout' data-gp-id='2'>です</span><br>Verb + <strong><span class='gp-popout' data-gp-id='143'>と</span></strong> + <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong> + <span class='gp-popout' data-gp-id='2'>です</span>",
                    "casual-structure": "<span class='gp-popout' data-gp-id='102'>Verb［たら］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong><br><span class='gp-popout' data-gp-id='154'>Verb［ば］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong><br>Verb + <strong><span class='gp-popout' data-gp-id='143'>と</span></strong> + <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong>",
                    "part-of-speech": "",
                    "register": "一般",
                    "word-type": "",
                    "slug": "たらいい-といい",
                    "created-at": "2017-10-13T04:36:53Z",
                    "updated-at": "2022-08-28T06:30:23Z"
                }
            }

            const result = mapBunProGrammarPoint(input);

            expect(result.id).toBe('212');
            expect(result.level).toBe("JLPT3");
            expect(result.title).toBe("たらいい・といい");
            expect(result.yomikata).toBe("たらいい・といい");
            expect(result.meaning).toBe("it would be nice if, it would be good if, should・I hope");
            expect(result.structure).toBe("Verb[<strong>た</strong>] + <strong>ら</strong> + <strong>いい</strong>, Verb + <strong>と</strong> + <strong>いい</strong><br><br><a href='https://bunpro.jp/grammar_points/102' target='_blank'>たら Review</a>");
            expect(result.lessonId).toBe(21);
            expect(result.nuance).toBe("");
            expect(result.grammarOrder).toBe(304);
            expect(result.formal).toBe(false);
            expect(result.metadata).toBe("taraii toii baii");
            expect(result.slug).toBe("たらいい-といい");
            expect(result.politeStructure).toBe("<span class='gp-popout' data-gp-id='102'>Verb［たら］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong> + <span class='gp-popout' data-gp-id='2'>です</span><br><span class='gp-popout' data-gp-id='154'>Verb［ば］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong> + <span class='gp-popout' data-gp-id='2'>です</span><br>Verb + <strong><span class='gp-popout' data-gp-id='143'>と</span></strong> + <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong> + <span class='gp-popout' data-gp-id='2'>です</span>");
            expect(result.casualStructure).toBe("<span class='gp-popout' data-gp-id='102'>Verb［たら］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong><br><span class='gp-popout' data-gp-id='154'>Verb［ば］</span>+ <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong><br>Verb + <strong><span class='gp-popout' data-gp-id='143'>と</span></strong> + <strong><span class='gp-popout' data-gp-id='7'>いい</span></strong>");
            expect(result.partOfSpeech).toBe("");
            expect(result.register).toBe("一般");
            expect(result.discourseLink).toBe("https://community.bunpro.jp/t/grammar-discussion/1208");
            expect(result.caution).toBe(null);

            expect(result.createdAt.getTime()).toBe(1507869413000);
            expect(result.updatedAt?.getTime()).toBe(1661668223000);

        });

    });

});

