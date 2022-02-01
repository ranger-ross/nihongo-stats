export function daysToMillis(days) {
    return days * 86_400_000;
}

export function millisToDays(millis) {
    return Math.floor(millis / (86400000));
}

export function millisToHours(millis) {
    return Math.floor(millis / (86400000 / 24));
}

export function hoursToMillis(hours) {
    return hours * (1000 * 60 * 60);
}

export function addDays(date, days) {
    let _date = new Date(date);
    _date.setDate(date.getDate() + days);
    return _date;
}

export function addHours(date, hours) {
    let _date = new Date(date);
    _date.setTime(date.getTime() + hoursToMillis(hours));
    return _date;
}

export function areDatesSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function areDatesSameDayAndHour(date1, date2) {
    return (
        areDatesSameDay(date1, date2) &&
        date1.getHours() === date2.getHours()
    );
}

export function truncDate(date) {
    return new Date(new Date(date).toDateString());
}

export function truncMinutes(date) {
    let _date = new Date(date);
    _date.setHours(_date.getHours() + Math.round(_date.getMinutes() / 60));
    _date.setMinutes(0, 0, 0);
    return _date;
}