import { Card, CardContent, Typography } from "@material-ui/core";
import WanikaniApiService from "../service/WanikaniApiService";
import { useState, useEffect } from "react";
import { WanikaniBlueButton, WanikaniPinkButton } from "../components/WanikaniButtons";

function WanikaniWelcomeTile() {
    const [username, setUsername] = useState('');
    const [lessons, setLessons] = useState(0);
    const [reviews, setReviews] = useState(0);

    useEffect(() => {
        let isSubscribed = true;
        WanikaniApiService.getUser()
            .then(user => {
                if (!isSubscribed)
                    return;
                setUsername(user.data.username);
            });
        WanikaniApiService.getSummary()
            .then(summary => {
                if (!isSubscribed)
                    return;
                let lsn = 0;
                for (const group of summary.data.lessons) {
                    if (new Date(group['available_at']).getTime() < Date.now()) {
                        lsn += group['subject_ids'].length;
                    }
                }

                let rvws = 0;
                for (const group of summary.data.reviews) {
                    if (new Date(group['available_at']).getTime() < Date.now()) {
                        rvws += group['subject_ids'].length;
                    }
                }
                setLessons(lsn);
                setReviews(rvws);
            });
        return () => isSubscribed = false;
    }, []);
    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={{ textShadow: '4px 4px 6px #000000bb' }}>
                    Welcome {username}
                </Typography>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '260px' }}>
                    <WanikaniPinkButton variant={'contained'}
                        onClick={() => window.open("https://www.wanikani.com/lesson", "_blank")}>
                        Lessons: {lessons}
                    </WanikaniPinkButton>

                    <WanikaniBlueButton variant={'contained'}
                        onClick={() => window.open("https://www.wanikani.com/review", "_blank")}>
                        Reviews: {reviews}
                    </WanikaniBlueButton>
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniWelcomeTile;