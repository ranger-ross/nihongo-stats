import {getColorByWanikaniSrsStage, getColorByWanikaniSubjectType} from "../WanikaniStyleUtil.js";
import {WanikaniColors} from "../../../Constants";

describe('WanikaniStyleUtil', function () {

    describe('getColorByWanikaniSrsStage', function () {

        it('should return locked for null', function () {
            expect(getColorByWanikaniSrsStage()).toBe(WanikaniColors.lockedGray);
            expect(getColorByWanikaniSrsStage(null)).toBe(WanikaniColors.lockedGray);
        });

        it('should return lesson for 0', function () {
            expect(getColorByWanikaniSrsStage(0)).toBe(WanikaniColors.lessonGray);
        });

        it('should return pink for 1,2,3,4', function () {
            expect(getColorByWanikaniSrsStage(1)).toBe(WanikaniColors.pink);
            expect(getColorByWanikaniSrsStage(2)).toBe(WanikaniColors.pink);
            expect(getColorByWanikaniSrsStage(3)).toBe(WanikaniColors.pink);
            expect(getColorByWanikaniSrsStage(4)).toBe(WanikaniColors.pink);
        });

        it('should return purple for 5,6', function () {
            expect(getColorByWanikaniSrsStage(5)).toBe(WanikaniColors.purple);
            expect(getColorByWanikaniSrsStage(6)).toBe(WanikaniColors.purple);
        });

        it('should return master blue for 7', function () {
            expect(getColorByWanikaniSrsStage(7)).toBe(WanikaniColors.masterBlue);
        });

        it('should return enlightened blue for 8', function () {
            expect(getColorByWanikaniSrsStage(8)).toBe(WanikaniColors.enlightenedBlue);
        });

        it('should return burned for 9', function () {
            expect(getColorByWanikaniSrsStage(9)).toBe(WanikaniColors.burnedGray);
        });
    });

    describe('getColorByWanikaniSubjectType', function () {

        it('should return blue for radicals', function () {
            expect(getColorByWanikaniSubjectType('radical')).toBe(WanikaniColors.blue);
        });

        it('should return pink for kanji', function () {
            expect(getColorByWanikaniSubjectType('kanji')).toBe(WanikaniColors.pink);
        });

        it('should return purple for vocabulary', function () {
            expect(getColorByWanikaniSubjectType('vocabulary')).toBe(WanikaniColors.purple);
        });

    });

});
