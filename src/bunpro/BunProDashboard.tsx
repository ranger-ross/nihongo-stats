import {RoutePaths} from "../Routes";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import {BunProWelcomeTile} from "./components/BunProWelcomeTile";
import BunProPreloadedData from "./components/BunProPreloadedData";
import {BunProJLPTTile} from "./components/BunProJLPTTile";
import BunProUpcomingReviewsChart from "./components/BunProUpcomingReviewsChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import {useDeviceInfo} from "../hooks/useDeviceInfo";
import BunProActiveItemsChart from "./components/BunProActiveItemsChart";
import {AppStyles} from "../util/TypeUtils";
import {useEffect, useState} from "react";
import BunProApiService from "./service/BunProApiService";
import {BunProUser} from "./models/BunProUser";
import {BunProGrammarPoint} from "./models/BunProGrammarPoint";
import {BunProReview} from "./models/BunProReview";

const styles: AppStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
    innerContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'stretch'
    },
    leftPanel: {
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
        flexGrow: '1',
    },
    rightPanel: {
        flexGrow: '25'
    },
};

function useBunProData() {
    const [user, setUser] = useState<BunProUser>();
    const [grammarPoints, setGrammarPoints] = useState<BunProGrammarPoint[]>();
    const [reviews, setReviews] = useState<BunProReview[]>();


    useEffect(() => {
        let isSubscribed = true;

        BunProApiService.getUser()
            .then(user => {
                if (!isSubscribed)
                    return;
                setUser(user);
            });

        BunProApiService.getGrammarPoints()
            .then(gp => {
                if (!isSubscribed)
                    return;
                setGrammarPoints(gp);
            });

        BunProApiService.getAllReviews()
            .then(resp => {
                if (!isSubscribed)
                    return;
                setReviews(resp.reviews);
            });

        return () => {
            isSubscribed = false;
        };
    }, [])


    return {
        user: user,
        grammarPoints: grammarPoints,
        reviews: reviews
    }
}

function BunProDashboard() {
    const {apiKey} = useBunProApiKey();
    const {isMobile} = useDeviceInfo();

    const {grammarPoints, user, reviews} = useBunProData()

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <div style={styles.container}>
                <BunProPreloadedData>
                    <div style={styles.container}>

                        <div style={styles.innerContainer}>

                            <div style={{...styles.leftPanel, minWidth: !isMobile ? '500px' : undefined}}>
                                <BunProWelcomeTile/>

                                <BunProJLPTTile
                                    showXpProgress={true}
                                    grammarPoints={grammarPoints}
                                    reviews={reviews}
                                    user={user}
                                />
                            </div>

                            <div style={styles.rightPanel}>
                                <BunProUpcomingReviewsChart/>
                            </div>

                        </div>

                        <div>
                            <BunProActiveItemsChart/>
                        </div>
                    </div>
                </BunProPreloadedData>
            </div>
        </RequireOrRedirect>

    );
}

export default BunProDashboard;
