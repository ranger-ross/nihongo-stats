import {Button, Card, CardContent, Typography} from "@mui/material";
import {WanikaniBlueButton, WanikaniPinkButton} from "../../wanikani/components/WanikaniButtons.jsx";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.jsx";
import {useEffect, useState} from "react";
import {ankiColors} from "../../Constants.js";
import {fetchAnkiDeckSummaries} from "../../shared/AnkiDeckSummaries.jsx";
import WanikaniPendingLessonsAndReviews, {
    fetchWanikaniPendingLessonsAndReviews
} from "../../shared/WanikaniPendingLessonAndReviews";
import BunProPendingReviews from "../../shared/BunProPendingReviews.jsx";
import BunProApiService from "../../bunpro/service/BunProApiService.js";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey.jsx";
import {useBunProApiKey} from "../../hooks/useBunProApiKey.jsx";
import AnkiApiService from "../../anki/service/AnkiApiService.js";

const styles = {
    titleText: {
        textShadow: '4px 4px 6px #000000bb'
    },
    buttonContainer: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
        width: '260px',
        marginBottom: '15px'
    }

};

function AnkiDeckSummaries({deckData}) {
    return deckData.map(data => (
        <div key={data.deckName}>
            <strong>{data.deckName}</strong>
            <p>
                <strong>
                    <span>Reviews: <span style={{color: ankiColors.lightGreen}}>{data.dueCards}</span></span>
                    <span style={{marginLeft: '15px'}}>New: <span
                        style={{color: ankiColors.blue}}>{data.newCards}</span></span>
                </strong>
            </p>
        </div>
    ));
}

function AnkiSection() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [ankiDeckData, setAnkiDeckData] = useState([]);

    useEffect(() => {
        let isSubscribed = true;
        fetchAnkiDeckSummaries(selectedDecks)
            .then(data => {
                if (!isSubscribed)
                    return;
                setAnkiDeckData(data);
            });
        return () => isSubscribed = false;
    }, [selectedDecks]);

    return (
        <>
            <Typography variant={'h6'} style={styles.titleText}>
                Anki
            </Typography>

            <div style={{marginBottom: '15px', marginLeft: '10px'}}>
                <AnkiDeckSummaries deckData={ankiDeckData}/>
            </div>
        </>
    );
}

function WanikaniSection() {
    const [wanikaniStudyData, setWanikaniStudyData] = useState();

    useEffect(() => {
        let isSubscribed = true;
        fetchWanikaniPendingLessonsAndReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setWanikaniStudyData(data);
            });
        return () => isSubscribed = false;
    }, [])

    return (
        <>
            <Typography variant={'h6'} style={styles.titleText}>
                Wanikani
            </Typography>

            <div style={{...styles.buttonContainer, marginBottom: '0'}}>
                <WanikaniPendingLessonsAndReviews
                    lessons={wanikaniStudyData?.lessons}
                    reviews={wanikaniStudyData?.reviews}
                />
            </div>
        </>
    );
}

function BunProSection() {
    const [pendingReviews, setPendingReviews] = useState(0);

    useEffect(() => {
        let isSubscribed = true;
        BunProApiService.getPendingReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setPendingReviews(data.length);
            });
        return () => isSubscribed = false;
    }, []);

    return (
        <>
            <Typography variant={'h6'} style={styles.titleText}>
                BunPro (username)
            </Typography>

            <div style={styles.buttonContainer}>
                <BunProPendingReviews count={pendingReviews}/>
            </div>
        </>
    );
}


function OverviewWelcomeTile() {
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();
    const [isAnkiConnected, setIsAnkiConnected] = useState(false);

    useEffect(() => {
        let isSubscribed = true;

        AnkiApiService.connect()
            .then(isConnected => {
                if (!isSubscribed)
                    return;
                setIsAnkiConnected(isConnected);
            });
        return () => isSubscribed = false;
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'} style={{...styles.titleText, marginBottom: '15px'}}>
                    Pending Reviews
                </Typography>

                {isAnkiConnected ? (<AnkiSection/>) : null}
                {bunProApiKey ? (<BunProSection/>) : null}
                {wanikaniApiKey ? (<WanikaniSection/>) : null}
            </CardContent>
        </Card>
    );
}

export default OverviewWelcomeTile;
