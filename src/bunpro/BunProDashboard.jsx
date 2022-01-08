import {useEffect} from "react";
import {RoutePaths} from "../Routes.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";
import {BunProWelcomeTile} from "./components/BunProWelcomeTile.jsx";
import BunProApiService from "./service/BunProApiService.js";
import BunProPreloadedData from "./components/BunProPreloadedData.jsx";
import {BunProJLPTTile} from "./components/BunProJLPTTile";
import BunProUpcomingReviewsChart from "./components/BunProUpcomingReviewsChart.jsx";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";

const styles = {
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
        minWidth: '500px'
    },
    rightPanel: {
        flexGrow: '25'
    },
};

function BunProDashboard() {

    const {apiKey} = useBunProApiKey();

    useEffect(() => {
        BunProApiService.getUserProgress()
            .then(console.log)
            .catch(console.error);
    }, []);

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <div style={styles.container}>
                <BunProPreloadedData>
                    <div style={styles.container}>

                        <div style={styles.innerContainer}>

                            <div style={styles.leftPanel}>
                                <BunProWelcomeTile/>

                                <BunProJLPTTile/>
                            </div>

                            <div style={styles.rightPanel}>
                                <BunProUpcomingReviewsChart/>
                            </div>

                        </div>
                    </div>
                </BunProPreloadedData>
            </div>
        </RequireOrRedirect>

    );
}

export default BunProDashboard;