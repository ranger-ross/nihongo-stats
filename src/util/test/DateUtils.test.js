import {areDatesSameDay, millisToDays, millisToHours, truncDate} from "../DateUtils.js";

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

    describe('truncDate()', function () {

        it('should trunc date properly', function () {
            expect(truncDate(1640020316111).getTime()).toBe(1639958400000);
        });

    });

});