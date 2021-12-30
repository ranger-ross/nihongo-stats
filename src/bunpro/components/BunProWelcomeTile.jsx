import {Button, Card, CardContent, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import BunProApiService from "../service/BunProApiService.js";

const styles = {
    welcomeText: {
        textShadow: '4px 4px 6px #000000bb'
    },

};

export function BunProWelcomeTile() {

    const [user, setUser] = useState();

    useEffect(() => {
        let isSubscribed = true;

        BunProApiService.getUser()
            .then(user => {
                if (!isSubscribed)
                    return;

                setUser(user);

            });
        return () => isSubscribed = false;
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={styles.welcomeText}>
                    Welcome {user?.username}
                </Typography>

                {/*<div style={{display: 'flex', gap: '10px', marginTop: '10px', width: '260px'}}>*/}
                {/*    <Button variant="contained">*/}
                {/*        Lessons: {!!user ? user['new_reviews'].length : null}*/}
                {/*    </Button>*/}
                {/*</div>*/}
            </CardContent>
        </Card>
    );
}