import {RoutePaths} from "../Routes";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import {BunProWelcomeTile} from "./components/BunProWelcomeTile";
import {BunProLoadingScreen} from "./components/BunProPreloadedData";
import {BunProJLPTTile} from "./components/BunProJLPTTile";
import BunProUpcomingReviewsChart from "./components/BunProUpcomingReviewsChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import {useDeviceInfo} from "../hooks/useDeviceInfo";
import BunProActiveItemsChart from "./components/BunProActiveItemsChart";
import {AppStyles} from "../util/TypeUtils";
import {useBunProData} from "../hooks/useBunProData";

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

function BunProDashboardContent() {
    const {isMobile} = useDeviceInfo();

    const {grammarPoints, user, reviewData, pendingReviewsCount, isLoading: isBpLoading} = useBunProData({
        reviews: true,
        pendingReviews: true,
        grammarPoints: true,
        user: true
    });

    const isLoading = !grammarPoints || !reviewData;

    if (isLoading) {
        return (
            <BunProLoadingScreen
                config={{
                    reviews: true,
                    grammarPoints: true
                }}
                grammarPoints={grammarPoints}
                reviews={reviewData}
            />
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.container}>
                <div style={styles.innerContainer}>
                    <div style={{...styles.leftPanel, minWidth: !isMobile ? '500px' : undefined}}>
                        <BunProWelcomeTile
                            user={user}
                            pendingReviewsCount={pendingReviewsCount}
                        />

                        <BunProJLPTTile
                            showXpProgress={true}
                            grammarPoints={grammarPoints}
                            reviews={reviewData?.reviews}
                            user={user}
                        />
                    </div>

                    <div style={styles.rightPanel}>
                        <BunProUpcomingReviewsChart
                            reviews={reviewData?.reviews}
                            grammarPoints={grammarPoints}
                            ghostReviews={reviewData?.ghostReviews}
                            pendingReviewsCount={pendingReviewsCount}
                        />
                    </div>

                </div>

                <div>
                    <BunProActiveItemsChart
                        showBunProHeader={false}
                        grammarPoints={grammarPoints}
                        reviews={reviewData?.reviews}
                        user={user}
                    />
                </div>
            </div>

        </div>
    );
}

function BunProDashboard() {
    const {apiKey} = useBunProApiKey();
    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <BunProDashboardContent/>
        </RequireOrRedirect>
    );
}

export default BunProDashboard;
