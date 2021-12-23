import {getVisibleLabelIndices} from "../ChartUtils.js";

describe('ChartUtils', function () {
    describe('getVisibleLabelIndices()', function () {

        it('should return correct indices for 3 labels with data.length = 3', function () {
            const data = getVisibleLabelIndices(dummyData(3), 3);
            expect(data.length).toBe(3);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(1);
            expect(data[2]).toBe(2);
        });

        it('should return correct indices for 3 labels with data.length = 5', function () {
            const data = getVisibleLabelIndices(dummyData(5), 3);
            expect(data.length).toBe(3);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(2);
            expect(data[2]).toBe(4);
        });

        it('should return correct indices for 5 labels with data.length = 5', function () {
            const data = getVisibleLabelIndices(dummyData(5), 5);
            expect(data.length).toBe(5);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(1);
            expect(data[2]).toBe(2);
            expect(data[3]).toBe(3);
            expect(data[4]).toBe(4);
        });

        // [0, 1, 2, 3, 4, 5]
        //     *     *     *
        it('should return correct indices for 4 labels with data.length = 6', function () {
            const data = getVisibleLabelIndices(dummyData(6), 4);
            expect(data.length).toBe(3);
            expect(data[0]).toBe(1);
            expect(data[1]).toBe(3);
            expect(data[2]).toBe(5);
        });

    });
});


function dummyData(length) {
    let data = [];
    for (let i = 0; i < length; i++) {
        data.push(i);
    }
    return data;
}