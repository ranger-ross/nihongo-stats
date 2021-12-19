import {useWanikaniApiKey} from "./stores/WanikaniApiKeyStore";
import {Navigate} from "react-router";
import {RoutePaths} from "../Routes";
import WanikaniLevelProgessChart from "./charts/WanikaniLevelProgressChart";
import {Card, CircularProgress, Typography} from "@material-ui/core";
import WanikaniTotalItemsHistoryChart from "./charts/WanikaniTotalItemsHistoryChart";
import WanikaniReviewsHistoryChart from "./charts/WanikaniReviewsHistoryChart";
import WanikaniAccuracyHistoryChart from "./charts/WanikaniAccuracyHistoryChart";
import WanikaniHistorySummaryChart from "./charts/WanikaniHistorySummaryChart";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import ReactVisibilitySensor from "react-visibility-sensor";
import {useState} from "react";


function LoadableChart({placeholderTitle, children}) {
    const [isLoaded, setIsLoaded] = useState(false)
    return (
        <ReactVisibilitySensor partialVisibility={true} onChange={(isVisible) => isVisible ? setIsLoaded(true) : null}>
            <Card variant={'outlined'} style={{margin: '15px'}}>
                {isLoaded ? children : (
                    <div style={{height: '500px', textAlign: 'center'}}>
                        <Typography variant={'h5'}>{placeholderTitle}</Typography>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                )}
            </Card>
        </ReactVisibilitySensor>
    );
}

function WanikaniHistory() {
    const {apiKey} = useWanikaniApiKey();

    return (
        <>
            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true}/>) : (
                <WanikaniPreloadedData>
                    <div>

                        <Card variant={'outlined'} style={{margin: '15px'}}>
                            <WanikaniHistorySummaryChart/>
                        </Card>

                        <Card variant={'outlined'} style={{margin: '15px'}}>
                            <WanikaniReviewsHistoryChart/>
                        </Card>

                        <LoadableChart placeholderTitle="Total Items">
                            <WanikaniTotalItemsHistoryChart/>
                        </LoadableChart>

                        <LoadableChart placeholderTitle="Level Progress">
                            <WanikaniLevelProgessChart/>
                        </LoadableChart>

                        <LoadableChart placeholderTitle="Review Accuracy">
                            <WanikaniAccuracyHistoryChart/>
                        </LoadableChart>

                    </div>
                </WanikaniPreloadedData>
            )}
        </>
    );
}

export default WanikaniHistory;