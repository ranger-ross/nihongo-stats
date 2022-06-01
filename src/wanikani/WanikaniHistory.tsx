import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
// @ts-ignore
import {RoutePaths} from "../Routes";
import WanikaniLevelProgressChart from "./components/WanikaniLevelProgressChart";
import {Card, CircularProgress, Typography} from "@mui/material";
import WanikaniTotalItemsHistoryChart from "./components/WanikaniTotalItemsHistoryChart";
import WanikaniReviewsHistoryChart from "./components/WanikaniReviewsHistoryChart";
import WanikaniAccuracyHistoryChart from "./components/WanikaniAccuracyHistoryChart";
import WanikaniHistorySummaryChart from "./components/WanikaniHistorySummaryChart";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import ReactVisibilitySensor from "react-visibility-sensor";
import {useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import WanikaniStagesHistoryChart from "./components/WanikaniStagesHistoryChart";

type LoadableChartProps = {
    placeholderTitle: string
} & React.PropsWithChildren<any>;

function LoadableChart({placeholderTitle, children}: LoadableChartProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    return (
        <ReactVisibilitySensor partialVisibility={true}
                               onChange={(isVisible: boolean) => isVisible ? setIsLoaded(true) : null}>
            <Card style={{margin: '15px'}}>
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
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
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
                        <WanikaniLevelProgressChart/>
                    </LoadableChart>

                    <LoadableChart placeholderTitle="Stages">
                        <WanikaniStagesHistoryChart/>
                    </LoadableChart>

                    <LoadableChart placeholderTitle="Review Accuracy">
                        <WanikaniAccuracyHistoryChart/>
                    </LoadableChart>

                </div>
            </WanikaniPreloadedData>
        </RequireOrRedirect>
    );
}

export default WanikaniHistory;
