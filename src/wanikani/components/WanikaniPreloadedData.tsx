import {CSSProperties, PropsWithChildren, useEffect, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import {CircularProgress, Typography} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import {useWanikaniPreloadStatus} from "../../hooks/useWanikaniPreloadStatus";
import QuestionToolTip from "../../shared/QuestionToolTip";
import {EVENT_STATUS, MultiPageObservableEvent} from "../service/WanikaniApiServiceRxJs";
import LinearProgressWithLabel from "../../shared/LinearProgressWithLabel";
import {WanikaniReview} from "../models/WanikaniReview";

const styles: { [key: string]: CSSProperties } = {
    loadingItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'left',
        gap: '10px'
    },
    loadingItemsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20vh'
    },
    loadingItemsColumn: {
        display: 'flex',
        flexDirection: 'column'
    },
    infoContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};


type LoadingItemProps = {
    text: string | Element,
    isLoading: boolean,
}

function LoadingItem({text, isLoading}: LoadingItemProps) {
    return (
        <div style={styles.loadingItem}>
            <>
                {text}
                {isLoading ? <CircularProgress size={15}/> : <CheckIcon style={{color: 'lime'}}/>}
            </>
        </div>
    );
}

type WanikaniLoadingScreenFetchConfig = {
    assignments?: boolean
    user?: boolean
    summary?: boolean
    subjects?: boolean
    reviews?: boolean
};

type WanikaniLoadingScreenState = {
    assignments?: boolean
    user?: boolean
    summary?: boolean
    subjects?: boolean
    reviews?: boolean
};

type Progress = {
    isRateLimited: boolean
    progress: number
    isComplete: boolean
};

type WanikaniLoadingScreenProps = {
    fetch: WanikaniLoadingScreenFetchConfig
    isLoaded: WanikaniLoadingScreenState
    progress?: {
        reviews?: Progress
    }
};

export function WanikaniLoadingScreen({fetch, isLoaded}: WanikaniLoadingScreenProps) {
    return (
        <>
            <div style={styles.loadingItemsContainer}>
                <div style={styles.loadingItemsColumn}>
                    <strong>Loading Wanikani Data...</strong>
                    <br/>
                    {fetch.subjects ? (
                        <LoadingItem text={'Wanikani Items'} isLoading={!isLoaded.subjects}/>
                    ) : null}
                    {fetch.user ? (
                        <LoadingItem text={'User Data'} isLoading={!isLoaded.user}/>
                    ) : null}
                    {fetch.summary ? (
                        <LoadingItem text={'User Summary'} isLoading={!isLoaded.summary}/>
                    ) : null}
                    {fetch.assignments ? (
                        <LoadingItem text={'User Assignments'} isLoading={!isLoaded.assignments}/>
                    ) : null}
                    <br/>
                    {fetch.reviews ? (
                        <>
                            {/*<LoadingItem text={'User Reviews'} isLoading={!isReviewsLoaded}/>*/}
                            {/*<LinearProgressWithLabel value={reviewsProgress * 100}/>*/}

                            {/*{reviewsIsRateLimited && (*/}
                            {/*    <Typography variant="body2" color="text.secondary">*/}
                            {/*        Rate Limited. Continuing in a minute*/}
                            {/*    </Typography>*/}
                            {/*)}*/}
                        </>
                    ) : null}


                </div>
            </div>

            <div style={styles.infoContainer}>
                <p style={{textAlign: 'center'}}>
                    This may take a few minutes if you have a long history on Wanikani.
                </p>
                <QuestionToolTip text={
                    <>
                        Wanikani's API limits the number of requests we can make per minute. <br/>
                        If you have a long history, we will have to
                        wait a minute to continue fetching data. <br/> <br/>
                        Once the loaded, we will save your save data (on your computer)
                        so it will load quicker next time
                    </>
                }/>
            </div>
        </>
    );
}

function WanikaniPreloadedData({children}: PropsWithChildren<any>) {
    const [isSubjectsLoaded, setIsSubjectsLoaded] = useState(false);
    const [isUserLoaded, setIsUserLoaded] = useState(false);
    const [isAssignmentsLoaded, setIsAssignmentsLoaded] = useState(false);
    const [isReviewsLoaded, setIsReviewsLoaded] = useState(false);
    const [reviewsProgress, setReviewsProgress] = useState(0.0);
    const [reviewsIsRateLimited, setReviewsIsRateLimited] = useState(false);

    const [isSummaryLoaded, setIsSummaryLoaded] = useState(false);
    const {status, setStatus} = useWanikaniPreloadStatus();

    useEffect(() => {
        if (status) {
            return;
        }
        console.log('Preloading Wanikani Data');

        const reviewsPromise = new Promise<void>(resolve => {
            WanikaniApiService.getReviewAsObservable()
                .subscribe((event: MultiPageObservableEvent<WanikaniReview>) => {
                    if (event.status === EVENT_STATUS.IN_PROGRESS) {
                        setReviewsProgress((event.progress as number) / (event.size as number));
                    }
                    if (event.status === EVENT_STATUS.COMPLETE) {
                        setReviewsProgress(1.0);
                        resolve();
                    }
                    setReviewsIsRateLimited(event.status === EVENT_STATUS.RATE_LIMITED);
                });
        });

        Promise.all([
            WanikaniApiService.getSubjects()
                .then(() => setIsSubjectsLoaded(true)),
            WanikaniApiService.getUser()
                .then(() => setIsUserLoaded(true)),
            WanikaniApiService.getAllAssignments()
                .then(() => setIsAssignmentsLoaded(true)),
            WanikaniApiService.getSummary()
                .then(() => setIsSummaryLoaded(true)),
            reviewsPromise
                .then(() => setIsReviewsLoaded(true)),
        ])
            .then(() => {
                console.log('Wanikani Data preloaded');
                setStatus(true);
            });
    }, []);

    const isLoaded = status || (isSubjectsLoaded && isUserLoaded && isAssignmentsLoaded && isSummaryLoaded && isReviewsLoaded);

    return (
        <>
            {isLoaded ? (
                children
            ) : (
                <>
                    <div style={styles.loadingItemsContainer}>
                        <div style={styles.loadingItemsColumn}>
                            <strong>Loading Wanikani Data...</strong>
                            <br/>
                            <LoadingItem text={'Wanikani Items'} isLoading={!isSubjectsLoaded}/>
                            <LoadingItem text={'User Data'} isLoading={!isUserLoaded}/>
                            <LoadingItem text={'User Summary'} isLoading={!isSummaryLoaded}/>
                            <LoadingItem text={'User Assignments'} isLoading={!isAssignmentsLoaded}/>
                            <br/>
                            <LoadingItem text={'User Reviews'} isLoading={!isReviewsLoaded}/>

                            <LinearProgressWithLabel value={reviewsProgress * 100}/>

                            {reviewsIsRateLimited && (
                                <Typography variant="body2" color="text.secondary">
                                    Rate Limited. Continuing in a minute
                                </Typography>
                            )}

                        </div>
                    </div>

                    <div style={styles.infoContainer}>
                        <p style={{textAlign: 'center'}}>
                            This may take a few minutes if you have a long history on Wanikani.
                        </p>
                        <QuestionToolTip text={
                            <>
                                Wanikani's API limits the number of requests we can make per minute. <br/>
                                If you have a long history, we will have to
                                wait a minute to continue fetching data. <br/> <br/>
                                Once the loaded, we will save your save data (on your computer)
                                so it will load quicker next time
                            </>
                        }/>
                    </div>
                </>
            )}
        </>
    );
}

export default WanikaniPreloadedData;
