import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import WanikaniLevelSummaryChart from "./components/WanikaniLevelSummaryChart.jsx";
import WanikaniFutureReviewsChart from "./components/WanikaniFutureReviewsChart.jsx";
import WanikaniWelcomeTile from "./components/WanikaniWelcomeTile";
import WanikaniItemCountsChart from "./components/WanikaniItemCountsChart.jsx";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import WanikaniActiveItemsChart from "./components/WanikaniActiveItemChart.jsx";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    }
};

function WanikaniDashboard() {
    const {apiKey} = useWanikaniApiKey();
    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <WanikaniPreloadedData>
                <div style={styles.container}>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch'}}>

                        <div style={{display: 'flex', gap: '10px', flexDirection: 'column', flexGrow: '1'}}>
                            <WanikaniWelcomeTile/>

                            <WanikaniLevelSummaryChart/>

                            <WanikaniItemCountsChart/>
                        </div>

                        <div style={{flexGrow: '25'}}>
                            <WanikaniFutureReviewsChart/>
                        </div>

                    </div>
                </div>

                <div style={styles.container}>
                    <WanikaniActiveItemsChart/>
                </div>
            </WanikaniPreloadedData>
        </RequireOrRedirect>
    );
}

export default WanikaniDashboard;