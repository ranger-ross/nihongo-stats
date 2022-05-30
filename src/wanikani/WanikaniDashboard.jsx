import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import WanikaniLevelSummaryChart from "./components/WanikaniLevelSummaryChart.tsx";
import WanikaniUpcomingReviewsChart from "./components/WanikaniUpcomingReviewsChart.jsx";
import WanikaniWelcomeTile from "./components/WanikaniWelcomeTile";
import WanikaniItemCountsChart from "./components/WanikaniItemCountsChart.tsx";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import WanikaniActiveItemsChart from "./components/WanikaniActiveItemChart.tsx";
import RequireOrRedirect from "../shared/RequireOrRedirect.tsx";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
    topContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'stretch'
    },
    leftContainer: {
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
        flexGrow: '1'
    },
    rightContainer: {
        flexGrow: '25'
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
};

function WanikaniDashboard() {
    const {apiKey} = useWanikaniApiKey();
    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <WanikaniPreloadedData>
                <div style={styles.container}>
                    <div style={styles.topContainer}>
                        <div style={styles.leftContainer}>
                            <WanikaniWelcomeTile/>

                            <WanikaniLevelSummaryChart/>

                            <WanikaniItemCountsChart/>
                        </div>

                        <div style={styles.rightContainer}>
                            <WanikaniUpcomingReviewsChart/>
                        </div>
                    </div>
                </div>

                <div style={styles.bottomContainer}>
                    <WanikaniActiveItemsChart/>
                </div>
            </WanikaniPreloadedData>
        </RequireOrRedirect>
    );
}

export default WanikaniDashboard;
