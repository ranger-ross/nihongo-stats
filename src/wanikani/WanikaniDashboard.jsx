import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import { Grid } from "@material-ui/core";
import WanikaniLevelSummaryChart from "./charts/WanikaniLevelSummaryChart";
import WanikaniFutureReviewsChart from "./charts/WanikaniFutureReviewsChart";
import WanikaniWelcomeTile from "./components/WanikaniWelcomeTile";
import WanikaniActiveItemsChart from "./charts/WanikaniActiveItemsChart";

const useStyles = makeStyles({
    container: {
        margin: '10px'
    }
});

function WanikaniDashboard() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            <Grid container spacing={2}>

                <Grid item xs={12} sm={5} md={4} lg={2} xl={2}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                            <WanikaniWelcomeTile />
                        </div>
                        <div>
                            <WanikaniLevelSummaryChart />
                        </div>
                    </div>
                </Grid>

                <Grid item xs={12} sm={7} md={8} lg={10} xl={10}>
                    <WanikaniFutureReviewsChart />
                </Grid>

                <Grid item xs={12} sm={5} md={4} lg={2} xl={2}>
                    placeholder
                </Grid>

                <Grid item xs={12} sm={7} md={8} lg={10} xl={10}>
                    <WanikaniActiveItemsChart />
                </Grid>

            </Grid>

        </div>
    );
}

export default WanikaniDashboard;