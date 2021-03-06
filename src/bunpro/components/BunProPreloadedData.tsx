import {useEffect, useState} from "react";
import {CircularProgress} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import BunProApiService from "../service/BunProApiService";
import {useBunProPreloadStatus} from "../../hooks/useBunProPreloadStatus";
import {AppStyles} from "../../util/TypeUtils";

const styles: AppStyles = {
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
};

type LoadingItemProps = {
    text: string,
    isLoading: boolean,
};

function LoadingItem({text, isLoading}: LoadingItemProps) {
    return (
        <div style={styles.loadingItem}>
            {text}
            {isLoading ? <CircularProgress size={15}/> : <CheckIcon style={{color: 'lime'}}/>}
        </div>
    );
}

function BunProPreloadedData({children}: React.PropsWithChildren<any>) {
    const [grammarPoints, setGrammarPoints] = useState(false);
    const [allReviews, setAllReviews] = useState(false);
    const {status, setStatus} = useBunProPreloadStatus();

    useEffect(() => {
        if (status) {
            return;
        }
        console.log('Preloading BunPro Data');

        Promise.all([
            BunProApiService.getGrammarPoints()
                .then(() => setGrammarPoints(true)),
            BunProApiService.getAllReviews()
                .then(() => setAllReviews(true)),
        ])
            .then(() => {
                console.log('BunPro Data preloaded');
                setStatus(true);
            });
    }, []);

    const isLoaded = status || (grammarPoints && allReviews);

    return (
        <>
            {isLoaded ? (
                children
            ) : (
                <>
                    <div style={styles.loadingItemsContainer}>
                        <div style={styles.loadingItemsColumn}>
                            <strong>Loading BunPro Data...</strong>
                            <br/>
                            <LoadingItem text={'Grammar Points'} isLoading={!grammarPoints}/>
                            <LoadingItem text={'Reviews'} isLoading={!allReviews}/>
                        </div>
                    </div>

                    <p style={{textAlign: 'center'}}>
                        This may take a few minutes.
                    </p>

                </>
            )}
        </>
    );
}

export default BunProPreloadedData;
