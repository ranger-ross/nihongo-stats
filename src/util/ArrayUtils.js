export const distinct = function (array, compareFn) {
    return array.filter((e, i) => array.findIndex((a) => {
        if (compareFn) {
            return compareFn(a) === compareFn(e);
        }
        return a === e;
    }) === i);
};