import {WANIKANI_COLORS} from "../../Constants";

export function getColorByWanikaniSrsStage(stage?: number | null) {
    if (!stage && stage !== 0) {
        return WANIKANI_COLORS.lockedGray;
    }

    if (stage === 0) {
        return WANIKANI_COLORS.lessonGray;
    }

    if (stage > 0 && stage < 5) {
        return WANIKANI_COLORS.apprenticeGradient();
    }

    if (stage === 5 || stage === 6) {
        return WANIKANI_COLORS.guruGradient();
    }

    if (stage === 7) {
        return WANIKANI_COLORS.masterGradient();
    }

    if (stage === 8) {
        return WANIKANI_COLORS.enlightenedGradient();
    }

    if (stage === 9) {
        return WANIKANI_COLORS.burnedGradient();
    }
    return null;
}


export function getColorByWanikaniSubjectType(subjectType: 'radical' | 'kanji' | 'vocabulary') {
    if (subjectType === 'radical')
        return WANIKANI_COLORS.radicalGradient();
    else if (subjectType === 'kanji')
        return WANIKANI_COLORS.kanjiGradient();
    else
        return WANIKANI_COLORS.vocabularyGradient();
}

export function getColorByJLPTLevel(level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1') {
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
