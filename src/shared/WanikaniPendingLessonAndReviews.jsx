import {WanikaniBlueButton, WanikaniPinkButton} from "../wanikani/components/WanikaniButtons.jsx";

function WanikaniPendingLessonsAndReviews({lessons, reviews}) {
    return (
        <>
            <WanikaniPinkButton variant={'contained'}
                                onClick={() => window.open("https://www.wanikani.com/lesson", "_blank")}>
                Lessons: {lessons}
            </WanikaniPinkButton>

            <WanikaniBlueButton variant={'contained'}
                                onClick={() => window.open("https://www.wanikani.com/review", "_blank")}>
                Reviews: {reviews}
            </WanikaniBlueButton>
        </>
    );
}

export default WanikaniPendingLessonsAndReviews;