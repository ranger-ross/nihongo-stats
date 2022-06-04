import { describe, beforeEach, it, expect } from "vitest";
import {sortAndGetMedian} from "../MathUtils";

describe('MathUtils', function () {
    describe('getMedian()', function () {

        it('should return 1 for input [1]', function () {
            expect(sortAndGetMedian([1])).toBe(1);
        });

        it('should return 4 for input [4, 1, 5]', function () {
            expect(sortAndGetMedian([4, 1, 5])).toBe(4);
        });

        it('should return 2.5 for input [1, 2, 3, 4]', function () {
            expect(sortAndGetMedian([1, 2, 3, 4])).toBe(2.5);
        });

        it('should return 3.5 for input [1, 6, 2, 5, 3, 4]', function () {
            expect(sortAndGetMedian([1, 6, 2, 5, 3, 4])).toBe(3.5);
        });

    });
});
