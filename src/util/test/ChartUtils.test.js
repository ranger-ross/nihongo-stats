import {getVisibleLabelIndices} from "../ChartUtils.js";

describe('ChartUtils', function () {
    describe('getVisibleLabelIndices()', function () {

        // [0, 1, 2]
        //  *  *  *
        it('should return correct indices for 3 labels with data.length = 3', function () {
            const data = getVisibleLabelIndices(dummyData(3), 3);
            expect(data.length).toBe(3);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(1);
            expect(data[2]).toBe(2);
        });

        // [0, 1, 2, 3, 4]
        //  *     *     *
        it('should return correct indices for 3 labels with data.length = 5', function () {
            const data = getVisibleLabelIndices(dummyData(5), 3);
            expect(data.length).toBe(3);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(2);
            expect(data[2]).toBe(4);
        });

        // [0, 1, 2, 3, 4, 5, 6]
        //  *        *        *
        it('should return correct indices for 3 labels with data.length = 7', function () {
            const data = getVisibleLabelIndices(dummyData(7), 3);
            expect(data.length).toBe(3);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(3);
            expect(data[2]).toBe(6);
        });

        // [0, 1, 2, 3, 4, 5, 6, 7, 8]
        //  *     *     *     *     *
        it('should return correct indices for 5 labels with data.length = 7', function () {
            const data = getVisibleLabelIndices(dummyData(7), 5);
            expect(data.length).toBe(5);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(2);
            expect(data[2]).toBe(4);
            expect(data[3]).toBe(6);
            expect(data[4]).toBe(8);
        });

        it('should return correct indices for 5 labels with data.length = 365', function () {
            const data = getVisibleLabelIndices(dummyData(365), 5);
            expect(data.length).toBe(5);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(90);
            expect(data[2]).toBe(181);
            expect(data[3]).toBe(272);
            expect(data[4]).toBe(364);
        });

        it('should return correct indices for 6 labels with data.length = 365', function () {
            const data = getVisibleLabelIndices(dummyData(365), 6);
            expect(data.length).toBe(6);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(72);
            expect(data[2]).toBe(145);
            expect(data[3]).toBe(218);
            expect(data[4]).toBe(291);
            expect(data[5]).toBe(364);
        });

        // [0, 1, 2, 3, 4]
        //  *  *  *  *  *
        it('should return correct indices for 5 labels with data.length = 5', function () {
            const data = getVisibleLabelIndices(dummyData(5), 5);
            expect(data.length).toBe(5);
            expect(data[0]).toBe(0);
            expect(data[1]).toBe(1);
            expect(data[2]).toBe(2);
            expect(data[3]).toBe(3);
            expect(data[4]).toBe(4);
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