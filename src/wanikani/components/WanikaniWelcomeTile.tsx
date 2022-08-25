import {Card, CardContent, Typography} from "@mui/material";
import WanikaniPendingLessonsAndReviews from "./WanikaniPendingLessonAndReviews";
import {WanikaniUser} from "../models/WanikaniUser";

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
    pendingLessons: number
    pendingReviews: number
};

function WanikaniWelcomeTile({user, pendingReviews = 0, pendingLessons = 0}: WanikaniWelcomeTileProps) {
    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={{textShadow: '4px 4px 6px #000000bb'}}>
                    {!!user && user.username?.length > 0 ? `Welcome ${user.username}` : null}
                </Typography>

                <div style={styles.buttonsContainer}>
                    <WanikaniPendingLessonsAndReviews
                        lessons={pendingLessons}
                        reviews={pendingReviews}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniWelcomeTile;
