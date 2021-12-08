import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import WanikaniLevelItemsChart from "./charts/WanikaniLevelItemsChart";
import ReactVisibilitySensor from "react-visibility-sensor";
import { useState } from "react";

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
    const [loadedLevels, setLoadedLevel] = useState({});

    function setLevelAsLoaded(level) {
        setLoadedLevel(s => ({ ...s, [level]: true }));
    }

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            {getWanikaniLevels().map(level => (
                <div key={level} className={classes.container} >
                    <ReactVisibilitySensor partialVisibility={true} onChange={(isVisible) => isVisible ? setLevelAsLoaded(level) : null} >
                        {loadedLevels[level] ? (
                            <WanikaniLevelItemsChart level={level} showLevel={true} />

                        ) : <div style={{height: '300px'}}></div>}
                    </ReactVisibilitySensor>
                </div>
            ))}

        </div>
    );
}

export default WanikaniItems;