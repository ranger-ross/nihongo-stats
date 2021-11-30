import { useEffect, useState } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { CircularProgress } from "@material-ui/core";
import CheckIcon from '@mui/icons-material/Check';
import { useWanikaniPreloadStatus } from "../stores/WanikaniPreloadStatusStore";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
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
        padding: '20%'
    },
    loadingItemsColumn: {
        display: 'flex',
        flexDirection: 'column'
    }
});


function LoadingItem({ text, isLoading }) {
    const classes = useStyles();
    return (
        <div className={classes.loadingItem}>
            {text}
            {isLoading ? <CircularProgress size={15} /> : <CheckIcon style={{ color: 'lime' }} />}
        </div>
    );
}

function WanikaniPreloadedData({ children }) {
    const classes = useStyles();
    const [isSubjectsLoaded, setIsSubjectsLoaded] = useState(false);
    const [isUserLoaded, setIsUserLoaded] = useState(false);
    const [isAssignmentsLoaded, setIsAssignmentsLoaded] = useState(false);
    const [isSummaryLoaded, setIsSummaryLoaded] = useState(false);
    const { status, setStatus } = useWanikaniPreloadStatus();

    useEffect(() => {
        if (status) {
            return;
        }
        console.log('Preloading Wanikani Data');

        const subjectsPromise = WanikaniApiService.getSubjects()
            .then(() => setIsSubjectsLoaded(true));

        const userPromise = WanikaniApiService.getUser()
            .then(() => setIsUserLoaded(true));

        const assignmentsPromise = WanikaniApiService.getAllAssignments()
            .then(() => setIsAssignmentsLoaded(true));

        const summaryPromise = WanikaniApiService.getSummary()
            .then(() => setIsSummaryLoaded(true));

        Promise.all([
            subjectsPromise,
            userPromise,
            assignmentsPromise,
            summaryPromise,
        ])
            .then(() => {
                console.log('Wanikani Data preloaded');
                setStatus(true);
            });
    }, []);

    const isLoaded = status || (isSubjectsLoaded && isUserLoaded && isAssignmentsLoaded && isSummaryLoaded);

    return (
        <>
            {isLoaded ? (
                children
            ) : (
                <>
                    <div className={classes.loadingItemsContainer}>
                        <div className={classes.loadingItemsColumn}>
                            <strong>Loading Wanikani Data...</strong>
                            <br />
                            <LoadingItem text={'Wanikani Items'} isLoading={!isSubjectsLoaded} />
                            <LoadingItem text={'User Data'} isLoading={!isUserLoaded} />
                            <LoadingItem text={'User Summary'} isLoading={!isSummaryLoaded} />
                            <LoadingItem text={'User Assignments'} isLoading={!isAssignmentsLoaded} />
                        </div>
                    </div>

                    <p style={{ textAlign: 'center' }}>
                        This may take a few minutes if you have a long history on Wanikani.
                    </p>

                </>
            )}
        </>
    );
}

export default WanikaniPreloadedData;