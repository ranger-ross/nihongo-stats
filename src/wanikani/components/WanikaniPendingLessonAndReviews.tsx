import {WanikaniColors} from "../../Constants";
import {ColoredButton, ColoredButtonProps} from "../../shared/ColoredButton";

type WanikaniCountButtonProps = {
    count: number,
    emptyColor?: string,
    label: string,
} & ColoredButtonProps;

function WanikaniCountButton(props: WanikaniCountButtonProps) {
    const color = props.count === 0 && !!props.emptyColor ? props.emptyColor : props.color

    const _props = {
        ...props
    };

    delete _props.emptyColor;

    return (
        <ColoredButton {..._props} color={color}>
            {props.label}: {props.count}
        </ColoredButton>
    );
}

type WanikaniPendingLessonsAndReviewsProps = {
    lessons: number,
    reviews: number
};

function WanikaniPendingLessonsAndReviews({lessons, reviews}: WanikaniPendingLessonsAndReviewsProps) {
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
