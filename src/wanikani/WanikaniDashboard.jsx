import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import WanikaniLevelSummaryChart from "./charts/WanikaniLevelSummaryChart";
import WanikaniFutureReviewsChart from "./charts/WanikaniFutureReviewsChart";
import WanikaniWelcomeTile from "./components/WanikaniWelcomeTile";
import WanikaniActiveItemsChart from "./charts/WanikaniActiveItemsChart";
import WanikaniItemCountsChart from "./charts/WanikaniItemCountsChart";

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
});

function WanikaniDashboard() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    return (
        <div>
            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            <div className={classes.container}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch' }}>

                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', flexGrow: '1' }}>
                        <WanikaniWelcomeTile />

                        <WanikaniLevelSummaryChart />

                        <WanikaniItemCountsChart />
                    </div>

                    <div style={{ flexGrow: '25' }}>
                        <WanikaniFutureReviewsChart />
                    </div>

                </div>
            </div>

            <div className={classes.container}>
                <WanikaniActiveItemsChart />
            </div>
        </div>
    );
}

export default WanikaniDashboard;