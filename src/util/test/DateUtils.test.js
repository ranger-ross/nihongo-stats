import {
    addDays,
    addHours,
    areDatesSameDay,
    areDatesSameDayAndHour,
    daysToMillis,
    millisToDays,
    millisToHours,
    truncDate
} from "../DateUtils.js";

describe('Timezones', () => {
    it('should always be UTC', () => {
        expect(new Date().getTimezoneOffset()).toBe(0);
    });
});

describe('DateUtils', function () {

    describe('millisToDays()', function () {

        it('should return 1 for input 86400000', function () {
            expect(millisToDays(86400000)).toBe(1)
        });

        it('should return 2 for input 172800000', function () {
            expect(millisToDays(172800000)).toBe(2)
        });

    });

    describe('millisToHours()', function () {
        it('should return 24 for input 86400000', function () {
            expect(millisToHours(86400000)).toBe(24)
        });

        it('should return 1 for input 3600000', function () {
            expect(millisToHours(3600000)).toBe(1)
        });

    });

    describe('areDatesSameDay()', function () {

        it('should return true when dates are the same', function () {
            let date1 = new Date(1640014747830);
            let date2 = new Date(1640014847830);
            expect(areDatesSameDay(date1, date2)).toBe(true);
        });

        it('should return false when dates are different', function () {
            let date1 = new Date(1640014747830);
            let date2 = new Date(1630014847830);
            expect(areDatesSameDay(date1, date2)).toBe(false);
        });

    });

    describe('areDatesSameDayAndHour()', function () {

        it('should return true when dates are the same', function () {
            let date1 = new Date(1640014747830);
            let date2 = new Date(1640014847830);
            expect(areDatesSameDayAndHour(date1, date2)).toBe(true);
        });

        it('should return false when dates are different', function () {
            let date1 = new Date(1640014747830);
            let date2 = new Date(1630014847830);
            expect(areDatesSameDayAndHour(date1, date2)).toBe(false);
        });

        it('should return false when dates are same, hours are different', function () {
            let date1 = new Date(1643747722244);
            let date2 = new Date(1643744100044);
            expect(areDatesSameDayAndHour(date1, date2)).toBe(false);
        });

        it('should return false when dates are different, hours are same', function () {
            let date1 = new Date(1643747722244);
            let date2 = new Date(1643661322244);
            expect(areDatesSameDayAndHour(date1, date2)).toBe(false);
        });

    });

    describe('addDays', function () {

        it('should add days properly', function () {
            expect(addDays(new Date(1643661322244), 1).getTime()).toBe(1643747722244)
        });

        it('should subtract days properly', function () {
            expect(addDays(new Date(1643661322244), -1).getTime()).toBe(1643574922244)
        });

    });

    describe('addHours', function () {

        it('should add hours properly', function () {
            expect(addHours(new Date(1643661322244), 1).getTime()).toBe(1643664922244)
        });

        it('should subtract hours properly', function () {
            expect(addHours(new Date(1643661322244), -1).getTime()).toBe(1643657722244)
        });

    });

    describe('truncDate()', function () {

        it('should trunc date properly', function () {
            expect(truncDate(1640020316111).getTime()).toBe(1639958400000);
        });

    });


    describe('daysToMillis()', function () {

        it('should return 0 for 0 days', function () {
            expect(daysToMillis(0)).toBe(0);
        });

        it('should return 86400000 for 1 day', function () {
            expect(daysToMillis(1)).toBe(86400000);
        });

        it('should return 432000000 for 5 days', function () {
            expect(daysToMillis(5)).toBe(432000000);
        });

    });

});