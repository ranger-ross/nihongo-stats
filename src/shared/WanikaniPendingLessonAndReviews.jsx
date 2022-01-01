import WanikaniApiService from "../wanikani/service/WanikaniApiService.js";
import {WanikaniBlueButton, WanikaniPinkButton} from "../wanikani/components/WanikaniButtons.jsx";

export async function fetchWanikaniPendingLessonsAndReviews() {
    const summary = await WanikaniApiService.getSummary();
    let lessons = 0;
    for (const group of summary.data.lessons) {
        if (new Date(group['available_at']).getTime() < Date.now()) {
            lessons += group['subject_ids'].length;
        }
    }

    let reviews = 0;
    for (const group of summary.data.reviews) {
        if (new Date(group['available_at']).getTime() < Date.now()) {
            reviews += group['subject_ids'].length;
        }
    }
    return {
        lessons,
        reviews
    };
}

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