export function distinct<T>(array: T[], compareFn: (entry: T) => string | number): T[] {
    if (!compareFn) {
        throw new Error("compareFn was missing when calling distinct(array, compareFn)");
    }

    const flags: { [key: number | string]: boolean } = {};

    return array.filter(entry => {
        if (flags[compareFn(entry)]) {
            return false;
        }
        flags[compareFn(entry)] = true;
        return true;
    });
}
