import {WanikaniColors} from "../../Constants.js";

export function getColorByWanikaniSrsStage(stage) {
    if (!stage && stage !== 0) {
        return WanikaniColors.lockedGray;
    }

    if (stage === 0) {
        return WanikaniColors.lessonGray;
    }

    if (stage > 0 && stage < 5) {
        return WanikaniColors.pink;
    }

    if (stage === 5 || stage === 6) {
        return WanikaniColors.purple;
    }

    if (stage === 7) {
        return WanikaniColors.masterBlue;
    }

    if (stage === 8) {
        return WanikaniColors.enlightenedBlue;
    }

    if (stage === 9) {
        return WanikaniColors.burnedGray;
    }
    return null;
}


export function getColorByWanikaniSubjectType(subjectType) {
    if (subjectType === 'radical')
        return WanikaniColors.blue;
    else if (subjectType === 'kanji')
        return WanikaniColors.pink;
    else
        return WanikaniColors.purple;
}

export function getColorByJLPTLevel(level) {
    if (level === 'N5')
        return '#3261c5'
    else if (level === 'N4')
        return '#48ad26'
    else if (level === 'N3')
        return '#d9697c'
    else if (level === 'N2')
        return '#c79f34'
    else if (level === 'N1')
        return '#00a0a9'
    return 'gray'
}