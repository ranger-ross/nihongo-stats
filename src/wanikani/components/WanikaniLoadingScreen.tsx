import {CSSProperties} from "react";
import {CircularProgress, Typography} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import QuestionToolTip from "../../shared/QuestionToolTip";
import LinearProgressWithLabel from "../../shared/LinearProgressWithLabel";

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

function WanikaniLoadingScreen({fetch, isLoaded, progress}: WanikaniLoadingScreenProps) {
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
                            <LoadingItem text={'User Reviews'} isLoading={!progress?.reviews?.isComplete}/>
                            <LinearProgressWithLabel value={(progress?.reviews?.progress ?? 0) * 100}/>

                            {progress?.reviews?.isRateLimited && (
                                <Typography variant="body2" color="text.secondary">
                                    Rate Limited. Continuing in a minute
                                </Typography>
                            )}
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

export default WanikaniLoadingScreen;