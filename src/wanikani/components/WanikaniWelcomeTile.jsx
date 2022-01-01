import {Card, CardContent, Typography} from "@mui/material";
import WanikaniApiService from "../service/WanikaniApiService";
import {useState, useEffect} from "react";
import WanikaniPendingLessonsAndReviews, {
    fetchWanikaniPendingLessonsAndReviews
} from "../../shared/WanikaniPendingLessonAndReviews.jsx";


function WanikaniWelcomeTile() {
    const [username, setUsername] = useState('');
    const [data, setData] = useState();

    useEffect(() => {
        let isSubscribed = true;
        WanikaniApiService.getUser()
            .then(user => {
                if (!isSubscribed)
                    return;
                setUsername(user.data.username);
            });
        fetchWanikaniPendingLessonsAndReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setData(data);
            });
        return () => isSubscribed = false;
    }, []);
    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={{textShadow: '4px 4px 6px #000000bb'}}>
                    Welcome {username}
                </Typography>

                <div style={{display: 'flex', gap: '10px', marginTop: '10px', width: '260px'}}>
                    <WanikaniPendingLessonsAndReviews
                        lessons={data?.lessons}
                        reviews={data?.reviews}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniWelcomeTile;