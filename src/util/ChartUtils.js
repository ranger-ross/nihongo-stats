export function getVisibleLabelIndices(data, maxNumberOfLabels) {
    if (data.length <= maxNumberOfLabels) {
        return data.map((_, i) => i);
    }

    const isOdd = data.length % 2 != 0;

    if (isOdd) {
        return getVisibleLabelIndicesOdd(0, data.length - 1, maxNumberOfLabels);
    } else {
        return getVisibleLabelIndicesEven(0, data.length - 1, maxNumberOfLabels);
    }
}

function distinct(array) {
    return array.filter((val, i, a) => i === a.findIndex(v => v === val));
}

function getVisibleLabelIndicesOdd(min, max, count) {
    const spacing = (max + 1) / (count - 1);

    let index = min;
    let indices = [index];

    while (indices.length < count) {
        index += spacing;
        indices.push(Math.floor(index) - 1);
    }

    return indices;
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



