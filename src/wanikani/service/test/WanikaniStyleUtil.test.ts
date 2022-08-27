import { describe, it, expect } from "vitest";
import {getColorByWanikaniSrsStage, getColorByWanikaniSubjectType} from "../WanikaniStyleUtil";
import {WANIKANI_COLORS} from "../../../Constants";

describe('WanikaniStyleUtil', function () {

    describe('getColorByWanikaniSrsStage', function () {

        it('should return locked for null', function () {
            expect(getColorByWanikaniSrsStage()).toBe(WANIKANI_COLORS.lockedGray);
            expect(getColorByWanikaniSrsStage(null)).toBe(WANIKANI_COLORS.lockedGray);
        });

        it('should return lesson for 0', function () {
            expect(getColorByWanikaniSrsStage(0)).toBe(WANIKANI_COLORS.lessonGray);
        });

        it('should return pink for 1,2,3,4', function () {
            expect(getColorByWanikaniSrsStage(1)).toBe(WANIKANI_COLORS.apprenticeGradient());
            expect(getColorByWanikaniSrsStage(2)).toBe(WANIKANI_COLORS.apprenticeGradient());
            expect(getColorByWanikaniSrsStage(3)).toBe(WANIKANI_COLORS.apprenticeGradient());
            expect(getColorByWanikaniSrsStage(4)).toBe(WANIKANI_COLORS.apprenticeGradient());
        });

        it('should return purple for 5,6', function () {
            expect(getColorByWanikaniSrsStage(5)).toBe(WANIKANI_COLORS.guruGradient());
            expect(getColorByWanikaniSrsStage(6)).toBe(WANIKANI_COLORS.guruGradient());
        });

        it('should return master blue for 7', function () {
            expect(getColorByWanikaniSrsStage(7)).toBe(WANIKANI_COLORS.masterGradient());
        });

        it('should return enlightened blue for 8', function () {
            expect(getColorByWanikaniSrsStage(8)).toBe(WANIKANI_COLORS.enlightenedGradient());
        });

        it('should return burned for 9', function () {
            expect(getColorByWanikaniSrsStage(9)).toBe(WANIKANI_COLORS.burnedGradient());
        });
    });

    describe('getColorByWanikaniSubjectType', function () {

        it('should return blue for radicals', function () {
            expect(getColorByWanikaniSubjectType('radical')).toBe(WANIKANI_COLORS.radicalGradient());
        });

        it('should return pink for kanji', function () {
            expect(getColorByWanikaniSubjectType('kanji')).toBe(WANIKANI_COLORS.kanjiGradient());
        });

        it('should return purple for vocabulary', function () {
            expect(getColorByWanikaniSubjectType('vocabulary')).toBe(WANIKANI_COLORS.vocabularyGradient());
        });

    });

});
