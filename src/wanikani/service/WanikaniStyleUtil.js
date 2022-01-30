import {WanikaniColors} from "../../Constants.js";

export function getColorByWanikaniSrsStage(stage) { // TODO: unit test
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
