import {Card, CardContent, IconButton, Menu, MenuItem, Typography} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.jsx";
import React, {useEffect, useState} from "react";
import AnkiDeckSummaries, {fetchAnkiDeckSummaries} from "../../shared/AnkiDeckSummaries.jsx";
import WanikaniPendingLessonsAndReviews, {
    fetchWanikaniPendingLessonsAndReviews
} from "../../shared/WanikaniPendingLessonAndReviews";
import BunProPendingReviews from "../../shared/BunProPendingReviews.jsx";
import BunProApiService from "../../bunpro/service/BunProApiService.js";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey.jsx";
import {useBunProApiKey} from "../../hooks/useBunProApiKey.jsx";
import AnkiApiService from "../../anki/service/AnkiApiService.js";
import {Add} from "@mui/icons-material";
import {useGlobalState} from "../../GlobalState.js";
import {ankiAppName, bunproAppName, wanikaniAppName} from "../../Constants.js";
import {useAnkiConnection} from "../../hooks/useAnkiConnection.jsx";

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
    },
    titleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
    },
};

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
                BunPro
            </Typography>

            <div style={styles.buttonContainer}>
                <BunProPendingReviews count={pendingReviews}/>
            </div>
        </>
    );
}

function AddAppDropdown({showAnki, showBunPro, showWanikani}) {
    const {setSelectedApp} = useGlobalState();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    return (
        <>
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
                <Add/>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
            >
                {showAnki ? (
                    <MenuItem onClick={() => setSelectedApp(ankiAppName)}>
                        Add Anki
                    </MenuItem>
                ) : null}

                {showBunPro ? (
                    <MenuItem onClick={() => setSelectedApp(bunproAppName)}>
                        Add BunPro
                    </MenuItem>
                ) : null}

                {showWanikani ? (
                    <MenuItem onClick={() => setSelectedApp(wanikaniAppName)}>
                        Add Wanikani
                    </MenuItem>
                ) : null}
            </Menu>
        </>
    );
}

function OverviewWelcomeTile() {
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();
    const isAnkiConnected = useAnkiConnection();

    const showAddAppDropdown = !isAnkiConnected || !bunProApiKey || !wanikaniApiKey;
    const showNotSignedIn = !isAnkiConnected && !bunProApiKey && !wanikaniApiKey;

    return (
        <Card>
            <CardContent>

                <div style={styles.titleContainer}>
                    <Typography variant={'h5'} style={{...styles.titleText, marginBottom: '15px'}}>
                        Pending Reviews
                    </Typography>

                    {showAddAppDropdown ? (
                        <AddAppDropdown
                            showAnki={!isAnkiConnected}
                            showBunPro={!bunProApiKey}
                            showWanikani={!wanikaniApiKey}
                        />
                    ) : null}

                </div>

                {isAnkiConnected ? (<AnkiSection/>) : null}
                {bunProApiKey ? (<BunProSection/>) : null}
                {wanikaniApiKey ? (<WanikaniSection/>) : null}

                {showNotSignedIn ? (
                    <div>
                        Connect an app using the + icon above
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

export default OverviewWelcomeTile;
