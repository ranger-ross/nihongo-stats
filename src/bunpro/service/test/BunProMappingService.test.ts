import {describe, expect, it} from "vitest";
import {RawBunProUser} from "../../models/raw/RawBunProUser";
import {mapBunProGrammarPoint, mapBunProReview, mapBunProUser} from "../BunProMappingService";
import {RawBunProGrammarPoint} from "../../models/raw/RawBunProGrammarPoint";
import {RawBunProReview} from "../../models/raw/RawBunProReview";


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

    describe('mapBunProReview', () => {

        it('should map review properly', () => {

            const input: RawBunProReview = {
                "id": 4885870,
                "user_id": 50627,
                "study_question_id": 8082,
                "grammar_point_id": 629,
                "times_correct": 13,
                "times_incorrect": 2,
                "streak": 9,
                "next_review": "2022-09-10T08:00:00.000Z",
                "created_at": "2022-03-19T21:27:00.078Z",
                "updated_at": "2022-07-10T09:51:06.555Z",
                "readings": [],
                "complete": true,
                "last_studied_at": "2022-07-10T09:51:06.554Z",
                "was_correct": true,
                "self_study": false,
                "review_misses": 0,
                "history": [
                    {
                        "id": 8077,
                        "time": "2022-03-19 21:00:00 +0000",
                        "status": true,
                        "attempts": 1,
                        "streak": 1
                    },
                    {
                        "id": 8078,
                        "time": "2022-03-20 02:00:00 +0000",
                        "status": true,
                        "attempts": 1,
                        "streak": 2
                    },
                ],
                "missed_question_ids": [
                    8082,
                    8085,
                ],
                "studied_question_ids": [
                    8077,
                    8078,
                ],
                "review_type": "standard",
                "max_streak": 9,
                "started_studying_at": "2022-03-19T21:00:00.000Z",
                "reviewable_type": "GrammarPoint",
                "reviewable_id": 629,
                "default_input_type": "Manual Input",
                "user_synonyms": ""
            }

            const result = mapBunProReview(input);

            expect(result.id).toBe(4885870);
            expect(result.createdAt.getTime()).toBe(1647725220078);
            expect(result.updatedAt?.getTime()).toBe(1657446666555);
            expect(result.lastStudiedAt?.getTime()).toBe(1657446666554);
            expect(result.startedStudyingAt?.getTime()).toBe(1647723600000);
            expect(result.nextReview?.getTime()).toBe(1662796800000);
            expect(result.userId).toBe(50627);
            expect(result.studyQuestionId).toBe(8082);
            expect(result.grammarPointId).toBe(629);
            expect(result.timesCorrect).toBe(13);
            expect(result.timesIncorrect).toBe(2);
            expect(result.streak).toBe(9);
            expect(result.complete).toBe(true);
            expect(result.wasCorrect).toBe(true);
            expect(result.selfStudy).toBe(false);
            expect(result.reviewMisses).toBe(0);
            expect(result.reviewType).toBe("standard");
            expect(result.maxStreak).toBe(9);
            expect(result.reviewableType).toBe("GrammarPoint");
            expect(result.reviewableId).toBe(629);
            expect(result.defaultInputType).toBe("Manual Input");
            expect(result.userSynonyms).toBe("");
            expect(result.readings.length).toBe(0);
            expect(result.missedQuestionIds.length).toBe(2);
            expect(result.missedQuestionIds[0]).toBe(8082);
            expect(result.missedQuestionIds[1]).toBe(8085);
            expect(result.studiedQuestionIds.length).toBe(2);
            expect(result.studiedQuestionIds[0]).toBe(8077);
            expect(result.studiedQuestionIds[1]).toBe(8078);

            expect(result.history.length).toBe(2);

            expect(result.history[0].id).toBe(8077);
            expect(result.history[0].attempts).toBe(1);
            expect(result.history[0].streak).toBe(1);
            expect(result.history[0].status).toBe(true);
            expect(result.history[0].time.getTime()).toBe(1647723600000);

            expect(result.history[1].id).toBe(8078);
            expect(result.history[1].attempts).toBe(1);
            expect(result.history[1].streak).toBe(2);
            expect(result.history[1].status).toBe(true);
            expect(result.history[1].time.getTime()).toBe(1647741600000);

        });

    });

});

