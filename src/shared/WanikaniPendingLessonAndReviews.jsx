import {WanikaniColors} from "../Constants.js";
import {ColoredButton} from "./ColoredButton.jsx";

function WanikaniCountButton(props) {
    const color = props.count === 0 && !!props.emptyColor ? props.emptyColor : props.color

    let _props = {
        ...props
    };

    delete _props.emptyColor;

    return (
        <ColoredButton {..._props} color={color}>
            {props.label}: {props.count}
        </ColoredButton>
    );
}

function WanikaniPendingLessonsAndReviews({lessons, reviews}) {
    return (
        <>
            <WanikaniCountButton variant={'contained'}
                                 label="Lessons"
                                 color={WanikaniColors.pink}
                                 emptyColor={WanikaniColors.lockedGray}
                                 onClick={() => window.open("https://www.wanikani.com/lesson", "_blank")}
                                 count={lessons}
            />

            <WanikaniCountButton variant={'contained'}
                                 label="Reviews"
                                 color={WanikaniColors.blue}
                                 emptyColor={WanikaniColors.lockedGray}
                                 onClick={() => window.open("https://www.wanikani.com/review", "_blank")}
                                 count={reviews}
            />
        </>
    );
}

export default WanikaniPendingLessonsAndReviews;