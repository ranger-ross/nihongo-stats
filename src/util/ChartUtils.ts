import {scaleBand as sb} from 'd3-scale';
import { FactoryFn } from "@devexpress/dx-react-chart";

// Fix type mismatch in React Chart
export const scaleBand: FactoryFn = sb as unknown as FactoryFn;


export function getVisibleLabelIndices(data: unknown[], maxNumberOfLabels: number) {
    if (data.length <= maxNumberOfLabels) {
        return data.map((_, i) => i);
    }

    if (data.length === 7 && [3, 4].includes(maxNumberOfLabels)) {
        return specialCase3Or4Labels7Length();
    }

    if (data.length === 5 && [3, 4].includes(maxNumberOfLabels)) {
        return specialCase3Or4Labels5Length();
    }

    const isOdd = data.length % 2 != 0;

    if (isOdd) {
        return getVisibleLabelIndicesOdd(0, data.length - 1, maxNumberOfLabels);
    } else {
        return getVisibleLabelIndicesEven(0, data.length - 1, maxNumberOfLabels);
    }
}

function specialCase3Or4Labels7Length() {
    return [0, 3, 6];
}

function specialCase3Or4Labels5Length() {
    return [0, 2, 4];
}

function getVisibleLabelIndicesOdd(min: number, max: number, count: number) {
    const spacing = (max + 1) / (count - 1);

    let index = min;
    const indices = [index];

    while (indices.length < count) {
        index += spacing;
        indices.push(Math.floor(index - 1));
    }

    return indices;
}


function getVisibleLabelIndicesEven(min: number, max: number, count: number) {
    const spacing = Math.ceil(max / count);

    const data = [max];
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



