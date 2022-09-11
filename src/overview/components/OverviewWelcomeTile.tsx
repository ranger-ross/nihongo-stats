import {Card, CardContent, IconButton, Menu, MenuItem, Typography} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import React, {useState} from "react";
import AnkiDeckSummaries from "../../anki/components/AnkiDeckSummaries";
import WanikaniPendingLessonsAndReviews from "../../wanikani/components/WanikaniPendingLessonAndReviews";
import BunProPendingReviews from "../../bunpro/components/BunProPendingReviews";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey";
import {useBunProApiKey} from "../../hooks/useBunProApiKey";
import {Add} from "@mui/icons-material";
import {useAnkiConnection} from "../../hooks/useAnkiConnection";
import {APP_NAMES} from "../../Constants";
import {useSelectedApp} from "../../hooks/useSelectedApp";
import {AppStyles} from "../../util/TypeUtils";
import {useAnkiDeckSummaries} from "../../anki/service/AnkiQueries";
import {useBunProPendingReviews} from "../../bunpro/service/BunProQueries";
import {useWanikaniSummary} from "../../wanikani/service/WanikaniQueries";
import {getPendingLessonsAndReviews} from "../../wanikani/service/WanikaniDataUtil";

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
    const {data: ankiDeckData, error} = useAnkiDeckSummaries(selectedDecks);
    error && console.error(error);

    return (
        <>
            <Typography variant={'h6'} style={styles.titleText}>
                Anki
            </Typography>

            <div style={{marginBottom: '15px', marginLeft: '10px'}}>
                <AnkiDeckSummaries deckData={ankiDeckData ?? []}/>
            </div>
        </>
    );
}

function WanikaniSection() {
    const {data, error} = useWanikaniSummary();
    error && console.error(error);
    const wanikaniStudyData = data ? getPendingLessonsAndReviews(data) : null;
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
    const {data, error} = useBunProPendingReviews();
    error && console.error(error);
    return (
        <>
            <Typography variant={'h6'} style={styles.titleText}>
                BunPro
            </Typography>

            <div style={styles.buttonContainer}>
                <BunProPendingReviews count={data?.length ?? 0}/>
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
                    <MenuItem onClick={() => setSelectedApp(APP_NAMES.anki)}>
                        Add Anki
                    </MenuItem>
                ) : null}

                {showBunPro ? (
                    <MenuItem onClick={() => setSelectedApp(APP_NAMES.bunpro)}>
                        Add BunPro
                    </MenuItem>
                ) : null}

                {showWanikani ? (
                    <MenuItem onClick={() => setSelectedApp(APP_NAMES.wanikani)}>
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
