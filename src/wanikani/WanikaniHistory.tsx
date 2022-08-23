import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import {RoutePaths} from "../Routes";
import WanikaniLevelProgressChart from "./components/WanikaniLevelProgressChart";
import {Card, CircularProgress, Typography} from "@mui/material";
import WanikaniTotalItemsHistoryChart from "./components/WanikaniTotalItemsHistoryChart";
import WanikaniReviewsHistoryChart from "./components/WanikaniReviewsHistoryChart";
import WanikaniAccuracyHistoryChart from "./components/WanikaniAccuracyHistoryChart";
import WanikaniHistorySummaryChart from "./components/WanikaniHistorySummaryChart";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import ReactVisibilitySensor from "react-visibility-sensor";
import {useEffect, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import WanikaniStagesHistoryChart from "./components/WanikaniStagesHistoryChart";
import WanikaniLessonHistoryChart from "./components/WanikaniLessonHistoryChart";
import WanikaniApiService from "./service/WanikaniApiService";
import {WanikaniAssignment} from "./models/WanikaniAssignment";
import {WanikaniSubject} from "./models/WanikaniSubject";
import {WanikaniReview} from "./models/WanikaniReview";
import {WanikaniLevelProgression} from "./models/WanikaniLevelProgress";
import {WanikaniUser} from "./models/WanikaniUser";

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

function WanikaniHistoryContent() {
    const [subjects, setSubjects] = useState<WanikaniSubject[]>([]);
    const [user, setUser] = useState<WanikaniUser>();
    const [levelProgress, setLevelProgress] = useState<WanikaniLevelProgression[]>([]);
    const [assignments, setAssignments] = useState<WanikaniAssignment[]>([]);
    const [reviews, setReviews] = useState<WanikaniReview[]>([]);
    const isLoading = [
        subjects, reviews, assignments, levelProgress
    ].some(data => data.length === 0) && !!user;

    useEffect(() => {
        let isSubscribed = true;

        WanikaniApiService.getAllAssignments()
            .then(data => {
                if (!isSubscribed)
                    return;
                setAssignments(data);
            });

        WanikaniApiService.getReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setReviews(data);
            })

        WanikaniApiService.getSubjects()
            .then(data => {
                if (!isSubscribed)
                    return;
                setSubjects(data);
            });

        WanikaniApiService.getLevelProgress()
            .then(data => {
                if (!isSubscribed)
                    return;
                setLevelProgress(data);
            });
        WanikaniApiService.getUser()
            .then(data => {
                if (!isSubscribed)
                    return;
                setUser(data);
            });

        return () => {
            isSubscribed = false;
        };
    }, []);

    return (
        <div>

            <Card variant={'outlined'} style={{margin: '15px'}}>
                <WanikaniHistorySummaryChart/>
            </Card>

            <Card variant={'outlined'} style={{margin: '15px'}}>
                <WanikaniReviewsHistoryChart reviews={reviews} subjects={subjects}/>
            </Card>

            <Card variant={'outlined'} style={{margin: '15px'}}>
                <WanikaniLessonHistoryChart assignments={assignments} subjects={subjects}/>
            </Card>

            <LoadableChart placeholderTitle="Total Items">
                <WanikaniTotalItemsHistoryChart assignments={assignments}/>
            </LoadableChart>

            <LoadableChart placeholderTitle="Level Progress">
                {user ? (
                    <WanikaniLevelProgressChart levelProgress={levelProgress} user={user}/>
                ) : null}
            </LoadableChart>

            <LoadableChart placeholderTitle="Stages">
                <WanikaniStagesHistoryChart/>
            </LoadableChart>

            <LoadableChart placeholderTitle="Review Accuracy">
                <WanikaniAccuracyHistoryChart/>
            </LoadableChart>

        </div>
    );
}

function WanikaniHistory() {
    const {apiKey} = useWanikaniApiKey();

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <WanikaniPreloadedData>
                <WanikaniHistoryContent/>
            </WanikaniPreloadedData>
        </RequireOrRedirect>
    );
}

export default WanikaniHistory;
