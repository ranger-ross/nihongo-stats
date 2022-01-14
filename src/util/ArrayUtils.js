export const distinct = function (array, compareFn) {
    const compare = !!compareFn ? compareFn : entry => entry;

    let flags = {};
    return array.filter(entry => {
        if (flags[compare(entry)]) {
            return false;
        }
        flags[compare(entry)] = true;
        return true;
    });
};