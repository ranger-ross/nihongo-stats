export const distinct = function (array, compareFn) {
    let flags = {};
    return array.filter(entry => {
        if (flags[compareFn(entry)]) {
            return false;
        }
        flags[compareFn(entry)] = true;
        return true;
    });
};