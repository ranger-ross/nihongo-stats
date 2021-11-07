export function millisToDays(millis) {
    return Math.floor(millis / (86400000));
}

export function millisToHours(millis) {
    return Math.floor(millis / (86400000 / 24));
}

export function addDays(date, days) {
    let _date = new Date(date);
    _date.setDate(date.getDate() + days);
    return _date;
}

export function areDatesSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}