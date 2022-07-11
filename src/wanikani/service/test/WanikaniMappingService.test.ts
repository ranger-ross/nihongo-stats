import {describe, beforeEach, it, expect} from "vitest";

import {RawWanikaniReset} from "../../models/raw/RawWanikaniReset";
import {mapWanikaniReset, mapWanikaniSubject} from "../WanikaniMappingService";
import {RawWanikaniSubject} from "../../models/raw/RawWanikaniSubject";


describe('WanikaniMappingService', () => {

    describe('mapWanikaniReset', () => {

        it('should map resets properly', () => {

            const input: RawWanikaniReset = {
                "id": 234,
                "object": "reset",
                "url": "https://api.wanikani.com/v2/resets/80463006",
                "data_updated_at": "2017-12-20T00:24:47.048380Z",
                "data": {
                    "created_at": "2017-12-20T00:03:56.642838Z",
                    "original_level": 42,
                    "target_level": 8,
                    "confirmed_at": "2017-12-19T23:31:18.077268Z"
                }
            }


            const result = mapWanikaniReset(input);

            expect(result.createdAt.getTime()).toBe(1513728236642);
            expect(result.confirmedAt.getTime()).toBe(1513726278077);
            expect(result.originalLevel).toBe(42);
            expect(result.targetLevel).toBe(8);

        });

    });

    describe('mapWanikaniSubject', () => {

        it('should map subject properly', () => {
            const rawKanji: RawWanikaniSubject = {
                "id": 601,
                "object": "kanji",
                "url": "https://api.wanikani.com/v2/subjects/601",
                "data_updated_at": "2022-06-10T20:58:00.493793Z",
                "data": {
                    "created_at": "2012-03-06T08:03:00.000000Z",
                    "level": 5,
                    "slug": "空",
                    "hidden_at": null,
                    "document_url": "https://www.wanikani.com/kanji/%E7%A9%BA",
                    "characters": "空",
                    "meanings": [
                        {
                            "meaning": "Sky",
                            "primary": true,
                            "accepted_answer": true
                        },
                        {
                            "meaning": "Empty",
                            "primary": false,
                            "accepted_answer": true
                        }
                    ],
                    "auxiliary_meanings": [],
                    "readings": [
                        {
                            "type": "onyomi",
                            "primary": true,
                            "reading": "くう",
                            "accepted_answer": true
                        },
                        {
                            "type": "kunyomi",
                            "primary": false,
                            "reading": "そら",
                            "accepted_answer": false
                        },
                        {
                            "type": "kunyomi",
                            "primary": false,
                            "reading": "あ",
                            "accepted_answer": false
                        },
                        {
                            "type": "kunyomi",
                            "primary": false,
                            "reading": "から",
                            "accepted_answer": false
                        },
                        {
                            "type": "kunyomi",
                            "primary": false,
                            "reading": "す",
                            "accepted_answer": false
                        }
                    ],
                    "component_subject_ids": [
                        78,
                        28,
                        25
                    ],
                    "amalgamation_subject_ids": [
                        2795,
                        2796,
                        3063,
                        3388,
                        3448,
                        3981,
                        5276,
                        5398,
                        5935,
                        6513,
                        6664,
                        6827,
                        7427,
                        7676,
                        7815,
                        8108,
                        8115,
                        9082
                    ],
                    "visually_similar_subject_ids": [
                        688,
                        1304
                    ],
                    "meaning_mnemonic": "Giving a <radical>roof</radical> <radical>legs</radical> is the kind of <radical>construction</radical> you do. You make it so a roof can be in the <kanji>sky</kanji>. In addition to meaning \"sky\", this kanji often means <kanji>empty</kanji>. Think about it - there's nothing more empty than the sky!",
                    "meaning_hint": "Think about it. If you give a roof legs, it goes even higher up. What's higher up? The sky is!",
                    "reading_mnemonic": "The reason you want to put a roof in the <kanji>sky</kanji> is because it gets the roof away from all the <reading>coo</reading>ties (<ja>くう</ja>) that are on the ground.",
                    "reading_hint": "Say \"coooooties\" nice and long, just like a little kid, to emphasize the long vowel in <ja>くう</ja>.",
                    "lesson_position": 63,
                    "spaced_repetition_system_id": 1
                }
            }


            const kanji = mapWanikaniSubject(rawKanji);

            expect(kanji.id).toBe(601);
            expect(kanji.url).toBe("https://api.wanikani.com/v2/subjects/601");
            expect(kanji.hiddenAt).toBe(null);
            expect(kanji.slug).toBe("空");
            expect(kanji.spacedRepetitionSystemId).toBe(1);
            expect(kanji.lessonPosition).toBe(63);
            expect(kanji.readingHint).toBe("Say \"coooooties\" nice and long, just like a little kid, to emphasize the long vowel in <ja>くう</ja>.");
            expect(kanji.meaningMnemonic).toBe("Giving a <radical>roof</radical> <radical>legs</radical> is the kind of <radical>construction</radical> you do. You make it so a roof can be in the <kanji>sky</kanji>. In addition to meaning \"sky\", this kanji often means <kanji>empty</kanji>. Think about it - there's nothing more empty than the sky!");
            expect(kanji.meaningHint).toBe("Think about it. If you give a roof legs, it goes even higher up. What's higher up? The sky is!");
            expect(kanji.readingMnemonic).toBe("The reason you want to put a roof in the <kanji>sky</kanji> is because it gets the roof away from all the <reading>coo</reading>ties (<ja>くう</ja>) that are on the ground.");
            expect(kanji.documentUrl).toBe("https://www.wanikani.com/kanji/%E7%A9%BA");
            expect(kanji.readings.length).toBe(5);
            expect(kanji.meanings.length).toBe(2);
            expect(kanji.componentSubjectIds?.length).toBe(3);
            expect(kanji.visuallySimilarSubjectIds?.length).toBe(2);
            expect(kanji.amalgamationSubjectIds?.length).toBe(18);
            expect(kanji.level).toBe(5);
            expect(kanji.object).toBe('kanji');
            expect(kanji.createdAt.getTime()).toBe(1331020980000);
            expect(kanji.dataUpdatedAt.getTime()).toBe(1654894680493);



        });


    });


});

