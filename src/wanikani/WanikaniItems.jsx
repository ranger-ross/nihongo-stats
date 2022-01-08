import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {Navigate} from "react-router";
import {RoutePaths} from "../Routes";
import WanikaniLevelItemsChart from "./components/WanikaniLevelItemsChart.jsx";
import ReactVisibilitySensor from "react-visibility-sensor";
import {useState} from "react";

const styles = {
    container: {
        margin: '5px'
    }
};

function getWanikaniLevels() {
    return Array.from({length: 60}, (_, i) => i + 1);
}

function WanikaniItems() {
    const {apiKey} = useWanikaniApiKey();
    const [loadedLevels, setLoadedLevel] = useState({});

    function setLevelAsLoaded(level) {
        setLoadedLevel(s => ({...s, [level]: true}));
    }

    return (
        <div style={styles.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin.path} replace={true}/>) : null}

            {getWanikaniLevels().map(level => (
                <div key={level} style={styles.container}>
                    <ReactVisibilitySensor partialVisibility={true}
                                           onChange={(isVisible) => isVisible ? setLevelAsLoaded(level) : null}>
                        {loadedLevels[level] ? (
                            <WanikaniLevelItemsChart level={level} showLevel={true}/>

                        ) : <div style={{height: '300px'}}></div>}
                    </ReactVisibilitySensor>
                </div>
            ))}

        </div>
    );
}

export default WanikaniItems;