export function daysToMillis(days: number) {
    return days * 86_400_000;
}

export function millisToDays(millis: number) {
    return Math.floor(millis / (86400000));
}

export function millisToHours(millis: number) {
    return Math.floor(millis / (86400000 / 24));
}

export function hoursToMillis(hours: number) {
    return hours * (1000 * 60 * 60);
}

export function addDays(date: Date | number, days: number) {
    const _date = new Date(date);
    _date.setDate(_date.getDate() + days);
    return _date;
}

export function addHours(date: Date | number, hours: number): Date {
    const _date = new Date(date);
    _date.setTime(_date.getTime() + hoursToMillis(hours));
    return _date;
}

export function areDatesSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function areDatesSameDayAndHour(date1: Date, date2: Date) {
    return (
        areDatesSameDay(date1, date2) &&
        date1.getHours() === date2.getHours()
    );
}

export function truncDate(date: Date | number) {
    return new Date(new Date(date).toDateString());
}

export function truncMinutes(date: Date | number) {
    const _date = new Date(date);
    _date.setHours(_date.getHours());
    _date.setMinutes(0, 0, 0);
    return _date;
}

export function truncWeek(date: Date | number) {
    let d = truncDate(date);

    while (d.getDay() != 0) {
        d = addDays(d, -1);
    }

    return d;
}

export function truncMonth(date: Date | number) {
    let d = truncDate(date);

    while (d.getDate() != 1) {
        d = addDays(d, -1);
    }

    return d;
}


export function getMonthName(date: Date, isShort = false) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const shortMonths = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    return isShort ? shortMonths[date.getMonth()] : months[date.getMonth()];
}

export function daysSinceDate(date: Date | number) {
    const millis = truncDate(Date.now()).getTime() - truncDate(date).getTime();
    return millisToDays(millis);
}
