import {Card, CardContent, Typography} from "@mui/material";
import {usePendingLessonsAndReviews, useWanikaniUser} from "../service/WanikaniApiService";
import WanikaniPendingLessonsAndReviews from "./WanikaniPendingLessonAndReviews.jsx";

const styles = {
    buttonsContainer: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
        width: '260px'
    },
};

function WanikaniWelcomeTile() {
    const {data: user} = useWanikaniUser();
    const data = usePendingLessonsAndReviews();
    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={{textShadow: '4px 4px 6px #000000bb'}}>
                    {user?.data?.username?.length > 0 ? `Welcome ${user.data.username}` : null}
                </Typography>

                <div style={styles.buttonsContainer}>
                    {data ? (
                        <WanikaniPendingLessonsAndReviews
                            lessons={data?.lessons}
                            reviews={data?.reviews}
                        />
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniWelcomeTile;
