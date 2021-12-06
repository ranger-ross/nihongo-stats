import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import WanikaniLevelItemsChart from "./charts/WanikaniLevelItemsChart";
import ReactVisibilitySensor from "react-visibility-sensor";

const useStyles = makeStyles({
    container: {
        margin: '5px'
    }
});

function getWanikaniLevels() {
    return Array.from({ length: 60 }, (_, i) => i + 1);
}

function WanikaniItems() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            {getWanikaniLevels().map(level => (
                <div className={classes.container} >
                    <ReactVisibilitySensor partialVisibility={true} >
                        <WanikaniLevelItemsChart level={level} showLevel={true} />
                    </ReactVisibilitySensor>
                </div>
            ))}

        </div>
    );
}

export default WanikaniItems;