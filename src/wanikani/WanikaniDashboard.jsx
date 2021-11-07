import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import WanikaniLevelProgessChart from "./charts/WanikaniLevelProgressChart";
import { Card } from "@material-ui/core";

const useStyles = makeStyles({
    container: {}
});

function WanikaniDashboard() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            <Card variant={'outlined'} style={{margin: '15px'}}>
                <WanikaniLevelProgessChart />
            </Card>

        </div>
    );
}

export default WanikaniDashboard;