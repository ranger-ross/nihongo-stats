import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import WanikaniLevelProgessChart from "./charts/WanikaniLevelProgressChart";
import { Card } from "@material-ui/core";
import WanikaniTotalItemsHistoryChart from "./charts/WanikaniTotalItemsHistoryChart";
import WanikaniReviewsHistoryChart from "./charts/WanikaniReviewsHistoryChart";
import WanikaniAccuracyHistoryChart from "./charts/WanikaniAccuracyHistoryChart";
import WanikaniHistorySummaryChart from "./charts/WanikaniHistorySummaryChart";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";

const useStyles = makeStyles({
    container: {}
});

function WanikaniHistory() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    return (
        <>
            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : (
                <WanikaniPreloadedData>
                    <div className={classes.container}>

                        <Card variant={'outlined'} style={{ margin: '15px' }}>
                            <WanikaniHistorySummaryChart />
                        </Card>

                        <Card variant={'outlined'} style={{ margin: '15px' }}>
                            <WanikaniReviewsHistoryChart />
                        </Card>

                        <Card variant={'outlined'} style={{ margin: '15px' }}>
                            <WanikaniTotalItemsHistoryChart />
                        </Card>

                        <Card variant={'outlined'} style={{ margin: '15px' }}>
                            <WanikaniLevelProgessChart />
                        </Card>

                        <Card variant={'outlined'} style={{ margin: '15px' }}>
                            <WanikaniAccuracyHistoryChart />
                        </Card>

                    </div>
                </WanikaniPreloadedData>
            )}
        </>
    );
}

export default WanikaniHistory;