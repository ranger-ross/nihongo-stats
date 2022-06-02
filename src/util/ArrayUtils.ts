export function distinct<T>(array: T[], compareFn: (entry: T) => string | number): T[] {

    let compare = compareFn;
    if (!compareFn) {
        compare = (entry: T) => entry as unknown as string | number;
    }

    const flags: { [key: number | string]: boolean } = {};

    return array.filter(entry => {
        if (flags[compare(entry)]) {
            return false;
        }
        flags[compare(entry)] = true;
        return true;
    });
}
