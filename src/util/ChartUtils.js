export function getVisibleLabelIndices(data, numberOfLabels) {
    if (data.length <= numberOfLabels) {
        return data.map((_, i) => i);
    }

    const isOdd = data.length % 2 != 0;

    if (isOdd) {
        return [
            0,
            ...getVisibleLabelIndicesOdd(0, data.length - 1, numberOfLabels - 2),
            data.length - 1
        ];
    } else {
        return getVisibleLabelIndicesEven(0, data.length - 1, numberOfLabels);
    }
}

function getVisibleLabelIndicesEven(min, max, count) {
    const spacing = Math.ceil(max / count);

    let data = [max];
    let current = max - spacing;
    while (current > min) {
        data.unshift(current);
        current -= spacing;
    }

    if ((max - min) > 25) {
        return [0, ...data]
    }

    return data;
}

function getVisibleLabelIndicesOdd(min, max, count) {
    const range = max - min;
    const half = range / 2;
    const value = max - half;

    if (count > 1 && value - 1 > min && value + 1 < max) {
        return [
            ...getVisibleLabelIndicesOdd(min, value, count - 1),
            value,
            ...getVisibleLabelIndicesOdd(value, max, count - 1),
        ];
    }
    return [value];
}



