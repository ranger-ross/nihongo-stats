import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import {RoutePaths} from "../Routes";
import WanikaniLevelProgressChart from "./components/WanikaniLevelProgressChart";
import {Card, CardContent, CircularProgress, Link, Typography} from "@mui/material";
import WanikaniTotalItemsHistoryChart from "./components/WanikaniTotalItemsHistoryChart";
import WanikaniReviewsHistoryChart from "./components/WanikaniReviewsHistoryChart";
import WanikaniAccuracyHistoryChart from "./components/WanikaniAccuracyHistoryChart";
import WanikaniHistorySummaryChart from "./components/WanikaniHistorySummaryChart";
import WanikaniLoadingScreen from "./components/WanikaniLoadingScreen";
import ReactVisibilitySensor from "react-visibility-sensor";
import React, {ReactNode, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import WanikaniStagesHistoryChart from "./components/WanikaniStagesHistoryChart";
import WanikaniLessonHistoryChart from "./components/WanikaniLessonHistoryChart";
import {useWanikaniData} from "../hooks/useWanikaniData";

type LoadableChartProps = {
    placeholderTitle: string
    children: ReactNode
};

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

    const {
        user,
        levelProgress,
        subjects,
        assignments,
        reviews,
        reviewsIsRateLimited,
        reviewsProgress,
        isLoading,
        resets
    } = useWanikaniData({
        user: true,
        subjects: true,
        assignments: true,
        levelProgress: true,
        reviews: true
    });

    if (isLoading) {
        return (
            <WanikaniLoadingScreen
                fetch={{
                    user: true,
                    assignments: true,
                    reviews: true,
                    subjects: true,
                }}
                isLoaded={{
                    user: !!user,
                    assignments: assignments.length > 0,
                    subjects: subjects.length > 0,
                }}
                progress={{
                    reviews: {
                        isRateLimited: reviewsIsRateLimited,
                        progress: reviewsProgress,
                        isComplete: reviewsProgress === 1.0
                    }
                }}

            />
        );
    }

    return (
        <>
            <Card style={{ margin: '15px' }}>
                <CardContent style={{ height: '100%' }}>
                    <Typography variant={'h5'} align={'center'}>
                        Notice
                    </Typography>

                    <Typography variant={'body1'} align={'center'}>
                        Due to performance issues, the Wanikani team has decided to partially disable the WK API. <br />
                        Some functionality may not work properly 😔 <br />
                        For more information, see the post <Link href="https://community.wanikani.com/t/api-changes-get-all-reviews/61617" target="_blank" >here</Link>
                    </Typography>

                </CardContent>
            </Card>


            <Card variant={'outlined'} style={{margin: '15px'}}>
                <WanikaniHistorySummaryChart
                    levelProgress={levelProgress}
                    user={user}
                    subjects={subjects}
                    reviews={reviews}
                />
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
                <WanikaniStagesHistoryChart
                    reviews={reviews}
                    subjects={subjects}
                    resets={resets}
                />
            </LoadableChart>

            <LoadableChart placeholderTitle="Review Accuracy">
                <WanikaniAccuracyHistoryChart
                    reviews={reviews}
                    subjects={subjects}
                />
            </LoadableChart>

        </>
    );
}

function WanikaniHistory() {
    const {apiKey} = useWanikaniApiKey();

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <WanikaniHistoryContent/>
        </RequireOrRedirect>
    );
}

export default WanikaniHistory;
