import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import { Card, Grid } from "@material-ui/core";
import WanikaniApiService from "./service/WanikaniApiService";
import WanikaniLevelSummaryChart from "./charts/WanikaniLevelSummaryChart";
import WanikaniFutureReviewsChart from "./charts/WanikaniFutureReviewsChart";

const useStyles = makeStyles({
    container: {
        margin: '10px'
    }
});

function WanikaniDashboard() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    WanikaniApiService.getUser(apiKey)
        .then(console.log);

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}



            <Grid container spacing={1} >

                <Grid item xs={12} sm={7} md={8} lg={9} xl={10}>
                    <WanikaniFutureReviewsChart />
                </Grid>

                <Grid item xs={12} sm={5} md={4} lg={3} xl={2}>
                    <WanikaniLevelSummaryChart />
                </Grid>

            </Grid>

        </div>
    );
}

export default WanikaniDashboard;