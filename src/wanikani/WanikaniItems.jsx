import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import WanikaniLevelItemsChart from "./components/WanikaniLevelItemsChart.jsx";
import ReactVisibilitySensor from "react-visibility-sensor";
import {useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";

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
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <div style={styles.container}>
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
        </RequireOrRedirect>
    );
}

export default WanikaniItems;