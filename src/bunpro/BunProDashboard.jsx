import {useEffect} from "react";
import {Navigate} from "react-router";
import {RoutePaths} from "../Routes.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";
import {BunProWelcomeTile} from "./components/BunProWelcomeTile.jsx";
import BunProApiService from "./service/BunProApiService.js";
import BunProPreloadedData from "./components/BunProPreloadedData.jsx";
import {BunProJLPTTile} from "./components/BunProJLPTTile";
import WanikaniWelcomeTile from "../wanikani/components/WanikaniWelcomeTile.jsx";
import WanikaniLevelSummaryChart from "../wanikani/components/WanikaniLevelSummaryChart.jsx";
import WanikaniItemCountsChart from "../wanikani/components/WanikaniItemCountsChart.jsx";
import WanikaniFutureReviewsChart from "../wanikani/components/WanikaniFutureReviewsChart.jsx";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    }
};

function BunProDashboard() {

    const {apiKey} = useBunProApiKey();

    useEffect(() => {
        BunProApiService.getUserProgress()
            .then(console.log)
            .catch(console.error);
    }, []);

    return (

        <div style={styles.container}>
            {!apiKey ? (<Navigate to={RoutePaths.bunproLogin} replace={true}/>) : (
                <BunProPreloadedData>
                    <div style={styles.container}>

                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch'}}>

                            <div style={{display: 'flex', gap: '10px', flexDirection: 'column', flexGrow: '1', minWidth: '500px'}}>
                                <BunProWelcomeTile/>

                                <BunProJLPTTile/>
                            </div>

                            <div style={{flexGrow: '25'}}>
                                placeholder
                            </div>

                        </div>


                    </div>
                </BunProPreloadedData>
            )}

        </div>
    );
}

export default BunProDashboard;