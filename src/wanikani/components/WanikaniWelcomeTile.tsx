import {Card, CardContent, Typography} from "@mui/material";
import WanikaniApiService from "../service/WanikaniApiService";
import {useEffect, useState} from "react";
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

function WanikaniWelcomeTile() {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<{ lessons: number, reviews: number }>();

    useEffect(() => {
        let isSubscribed = true;
        WanikaniApiService.getUser()
            .then((user: WanikaniUser) => {
                if (!isSubscribed)
                    return;
                setUsername(user.username);
            });
        WanikaniApiService.getPendingLessonsAndReviews()
            .then((data: { lessons: number, reviews: number }) => {
                if (!isSubscribed)
                    return;
                setData(data);
            });
        return () => {
            isSubscribed = false;
        };
    }, []);
    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={{textShadow: '4px 4px 6px #000000bb'}}>
                    {username?.length > 0 ? `Welcome ${username}` : null}
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
