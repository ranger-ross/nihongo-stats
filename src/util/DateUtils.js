export function millisToDays(millis) {
    return Math.floor(millis / (86400000));
}

export function millisToHours(millis) {
    return Math.floor(millis / (86400000 / 24));
}