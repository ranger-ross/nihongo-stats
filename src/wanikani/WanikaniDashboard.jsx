import {useWanikaniApiKey} from "./stores/WanikaniApiKeyStore";
import {Navigate} from "react-router";
import {RoutePaths} from "../Routes";
import WanikaniLevelSummaryChart from "./charts/WanikaniLevelSummaryChart";
import WanikaniFutureReviewsChart from "./charts/WanikaniFutureReviewsChart";
import WanikaniWelcomeTile from "./components/WanikaniWelcomeTile";
import WanikaniItemCountsChart from "./charts/WanikaniItemCountsChart";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import WanikaniActiveItemsChart from "./charts/WanikaniActiveItemChart";

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
        <>
            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true}/>) : (
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
            )}
        </>
    );
}

export default WanikaniDashboard;