import {Card, CardContent, IconButton, Menu, MenuItem, Typography} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import React, {useEffect, useState} from "react";
import AnkiDeckSummaries from "../../anki/components/AnkiDeckSummaries";
import WanikaniPendingLessonsAndReviews from "../../wanikani/components/WanikaniPendingLessonAndReviews";
import BunProPendingReviews from "../../bunpro/components/BunProPendingReviews";
import BunProApiService from "../../bunpro/service/BunProApiService";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey";
import {useBunProApiKey} from "../../hooks/useBunProApiKey";
import {Add} from "@mui/icons-material";
import {useAnkiConnection} from "../../hooks/useAnkiConnection";
import {AppNames} from "../../Constants";
import {useSelectedApp} from "../../hooks/useSelectedApp";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService";
import {AnkiDeckSummary, fetchAnkiDeckSummaries} from "../../anki/service/AnkiDataUtil";
import {AppStyles} from "../../util/TypeUtils";

const styles: AppStyles = {
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
    const [ankiDeckData, setAnkiDeckData] = useState<AnkiDeckSummary[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        fetchAnkiDeckSummaries(selectedDecks)
            .then(data => {
                if (!isSubscribed)
                    return;
                setAnkiDeckData(data);
            });
        return () => {
            isSubscribed = false;
        }
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
    const [wanikaniStudyData, setWanikaniStudyData] = useState<{ lessons: number, reviews: number }>();

    useEffect(() => {
        let isSubscribed = true;
        WanikaniApiService.getPendingLessonsAndReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setWanikaniStudyData(data);
            });
        return () => {
            isSubscribed = false;
        }
    }, [])

    return (
        <>
            <Typography variant={'h6'} style={styles.titleText}>
                Wanikani
            </Typography>

            <div style={{...styles.buttonContainer, marginBottom: '0'}}>
                <WanikaniPendingLessonsAndReviews
                    lessons={wanikaniStudyData?.lessons ?? 0}
                    reviews={wanikaniStudyData?.reviews ?? 0}
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
        return () => {
            isSubscribed = false;
        };
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

type AddAppDropdownProps = {
    showAnki: boolean,
    showBunPro: boolean,
    showWanikani: boolean
};

function AddAppDropdown({showAnki, showBunPro, showWanikani}: AddAppDropdownProps) {
    const {setSelectedApp} = useSelectedApp();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
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
                    <MenuItem onClick={() => setSelectedApp(AppNames.anki)}>
                        Add Anki
                    </MenuItem>
                ) : null}

                {showBunPro ? (
                    <MenuItem onClick={() => setSelectedApp(AppNames.bunpro)}>
                        Add BunPro
                    </MenuItem>
                ) : null}

                {showWanikani ? (
                    <MenuItem onClick={() => setSelectedApp(AppNames.wanikani)}>
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
        <Card style={{minHeight: '595px'}}>
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
