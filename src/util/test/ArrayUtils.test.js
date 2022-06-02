import {distinct} from "../ArrayUtils.ts";

describe('ArrayUtils', function () {

    describe('distinct()', function () {

        it('should return [1, 2] for input [1, 2, 2, 1]', function () {
            const result = distinct([1, 2, 2, 1]);
            expect(result.length).toBe(2);
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(2);
        });

        it('should return [{x:1}, {x:2}}] for input [{x:1}, {x:2}, {x:2}, {x:1}], e => e.x', function () {
            const result = distinct([{x: 1}, {x: 2}, {x: 2}, {x: 1}], e => e.x);
            expect(result.length).toBe(2);
            expect(result[0].x).toBe(1);
            expect(result[1].x).toBe(2);
        });

    });

});
