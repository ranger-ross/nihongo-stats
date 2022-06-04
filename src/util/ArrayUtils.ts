export function distinct<T>(array: T[], compareFn?: (entry: T) => string | number): T[] {
    const defaultCompare = (entry: T) => entry as unknown as string | number;
    const compare = !!compareFn ? compareFn : defaultCompare;

    const flags: { [key: number | string]: boolean } = {};

    return array.filter(entry => {
        if (flags[compare(entry)]) {
            return false;
        }
        flags[compare(entry)] = true;
        return true;
    });
}
