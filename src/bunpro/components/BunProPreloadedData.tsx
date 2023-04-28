import {CircularProgress} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import {AppStyles} from "../../util/TypeUtils";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import {BunProReviewsResponse} from "../models/BunProReviewsResponse";

const styles: AppStyles = {
    loadingItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // revert to left after removing notice
        gap: '10px',
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

type BunProLoadingScreenProps = {
    config: {
        grammarPoints: boolean
        reviews: boolean
    }
    grammarPoints?: BunProGrammarPoint[]
    reviews?: BunProReviewsResponse
};

export function BunProLoadingScreen({config, grammarPoints, reviews}: BunProLoadingScreenProps) {
    return (
        <>
            <div style={styles.loadingItemsContainer}>
                <div style={styles.loadingItemsColumn}>
                    <strong style={{textAlign: 'center'}}>Loading BunPro Data...</strong>
                    <br/>
                    {config.grammarPoints ? (
                        <LoadingItem text={'Grammar Points'} isLoading={!grammarPoints}/>
                    ) : null}
                    {config.reviews ? (
                        <LoadingItem text={'Reviews'} isLoading={!reviews}/>
                    ) : null}


                    <div style={{marginTop: '30px'}}><span style={{color: 'red'}}>Notice</span>: The BunPro API was recently changed. I am investigating possible fixes</div>

                </div>
            </div>

            <p style={{textAlign: 'center'}}>
                This may take a few minutes.
            </p>
        </>
    );
}
