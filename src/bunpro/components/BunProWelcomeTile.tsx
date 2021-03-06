import {Card, CardContent, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import BunProApiService from "../service/BunProApiService";
import BunProPendingReviews from "./BunProPendingReviews";
import {RawBunProUser} from "../models/raw/RawBunProUser";

const styles = {
    welcomeText: {
        textShadow: '4px 4px 6px #000000bb'
    },

};

export function BunProWelcomeTile() {

    const [user, setUser] = useState<RawBunProUser>();
    const [pendingReviews, setPendingReviews] = useState(0);

    useEffect(() => {
        let isSubscribed = true;

        BunProApiService.getUser()
            .then(user => {
                if (!isSubscribed)
                    return;
                setUser(user);
            });

        BunProApiService.getPendingReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setPendingReviews(data.length);
            });

        return () => {
            isSubscribed = false;
        }
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={styles.welcomeText}>
                    Welcome {user?.data?.attributes?.username}
                </Typography>

                <div style={{display: 'flex', gap: '10px', marginTop: '10px', width: '260px'}}>
                    <BunProPendingReviews count={pendingReviews}/>
                </div>
            </CardContent>
        </Card>
    );
}
