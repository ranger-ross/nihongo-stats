import {Card, CardContent, Typography} from "@mui/material";
import BunProPendingReviews from "./BunProPendingReviews";
import {BunProUser} from "../models/BunProUser";

const styles = {
    welcomeText: {
        textShadow: '4px 4px 6px #000000bb'
    },
};

type BunProWelcomeTileProps = {
    user?: BunProUser
    pendingReviewsCount: number
};

export function BunProWelcomeTile({user, pendingReviewsCount}: BunProWelcomeTileProps) {
    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={styles.welcomeText}>
                    Welcome {user?.username}
                </Typography>

                <div style={{display: 'flex', gap: '10px', marginTop: '10px', width: '260px'}}>
                    <BunProPendingReviews count={pendingReviewsCount}/>
                </div>
            </CardContent>
        </Card>
    );
}
