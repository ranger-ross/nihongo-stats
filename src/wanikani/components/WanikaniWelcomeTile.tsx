import {Card, CardContent, Typography} from "@mui/material";
import WanikaniPendingLessonsAndReviews from "./WanikaniPendingLessonAndReviews";
import {WanikaniUser} from "../models/WanikaniUser";
import {WanikaniSummary} from "../models/WanikaniSummary";
import {getPendingLessonsAndReviews} from "../service/WanikaniDataUtil";

const styles = {
    buttonsContainer: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
        width: '260px'
    },
};

type WanikaniWelcomeTileProps = {
    user?: WanikaniUser
    summary?: WanikaniSummary
};

function WanikaniWelcomeTile({user, summary}: WanikaniWelcomeTileProps) {
    const pendingTasks = summary ? getPendingLessonsAndReviews(summary): {
        reviews: 0,
        lessons: 0
    };
    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={{textShadow: '4px 4px 6px #000000bb'}}>
                    {!!user && user.username?.length > 0 ? `Welcome ${user.username}` : null}
                </Typography>

                <div style={styles.buttonsContainer}>
                    <WanikaniPendingLessonsAndReviews
                        lessons={pendingTasks.lessons}
                        reviews={pendingTasks.reviews}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniWelcomeTile;
