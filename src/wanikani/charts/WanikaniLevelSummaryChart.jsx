import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Box, Card, CardContent, Typography, Grid } from "@material-ui/core";
import { millisToDays } from '../../util/DateUtils';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Stack } from '@mui/material';

const racialColor = '#00a1f1';
const kanjiColor = '#f100a1';
const vocabularyColor = '#a100f1';

const useStyles = makeStyles({
    container: {
        width: 'clamp(300px, 100%, 350px)',
        aspectRatio: 1 / 1
    },
    daysUntilLevelContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    subjectsLabel: {
        marginLeft: '5px',
        marginRight: '5px',
        textAlign: 'center'
    }
});

const defaultData = {
    timeOnLevel: 0,
    timeLeft: 0,
    radicals: {
        passed: 0,
        total: 0,
    },
    kanji: {
        passed: 0,
        total: 0,
    },
    vocabulary: {
        passed: 0,
        total: 0,
    },
};

function FractionText({ top, bottom }) {
    return (
        <>
            <sup>{top}</sup>&frasl;<sub>{bottom}</sub>
        </>
    );
}

async function getCurrentLevelProgressData(apiKey) {
    const userData = await WanikaniApiService.getUser(apiKey)

    const currentLevel = userData.data.level;

    const levelsProgress = await WanikaniApiService.getLevelProgress(apiKey, currentLevel);
    const currentLevelProgress = levelsProgress.data[currentLevel - 1].data;

    let start;
    if (currentLevel > 1) {
        const previousLevelProgress = levelsProgress.data[currentLevel - 2].data;
        start = new Date(previousLevelProgress['passed_at']);
    } else {
        start = new Date(currentLevelProgress['started_at']);
    }

    const end = !!currentLevelProgress['passed_at'] ? new Date(currentLevelProgress['passed_at']) : new Date();
    const timeOnLevel = end.getTime() - start.getTime()

    const assignments = await WanikaniApiService.getAssignmentsForLevel(apiKey, currentLevel);

    const radicalsTotal = assignments.data.filter(s => s.data['subject_type'] === 'radical');
    const radicals = radicalsTotal.filter(s => !!s.data['passed_at']);
    const kanjiTotal = assignments.data.filter(s => s.data['subject_type'] === 'kanji');
    const kanji = kanjiTotal.filter(s => !!s.data['passed_at']);
    const vocabularyTotal = assignments.data.filter(s => s.data['subject_type'] === 'vocabulary');
    const vocabulary = vocabularyTotal.filter(s => !!s.data['passed_at']);
    return {
        timeOnLevel: timeOnLevel,
        timeLeft: 0, // TODO: calculate this
        radicals: {
            passed: radicals.length,
            total: radicalsTotal.length,
        },
        kanji: {
            passed: kanji.length,
            total: kanjiTotal.length,
        },
        vocabulary: {
            passed: vocabulary.length,
            total: vocabularyTotal.length,
        },
    };
}


function WanikaniLevelSummaryChart() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();
    const [progressData, setProgressData] = useState(defaultData);

    useEffect(() => {
        getCurrentLevelProgressData(apiKey)
            .then(data => setProgressData(data))
    }, []);

    return (
        <Card className={classes.container}>
            <CardContent style={{ height: '100%' }}>

                <Stack height={'100%'} >

                    <Box sx={{ flexGrow: 1 }} className={classes.daysUntilLevelContainer} >
                        <Typography variant={'h2'} style={{ textAlign: 'center' }}>
                            {/* TODO: Calculator and format Time Left */}
                            {progressData.timeLeft}
                        </Typography>
                        <Typography variant={'caption'} style={{ textAlign: 'center' }}>
                            Days until level
                        </Typography>

                    </Box>

                    <Grid item container alignItems={'center'}>
                        <Box style={{ textAlign: 'center' }}>
                            <Typography variant={'body1'} style={{ fontWeight: 'bold' }}>
                                {millisToDays(progressData.timeOnLevel)}
                            </Typography>
                            <Typography variant={'caption'}>
                                Days on level
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Box className={classes.subjectsLabel}>
                            <Typography variant={'body1'}>
                                <FractionText top={progressData.radicals.passed}
                                    bottom={progressData.radicals.total}
                                />
                            </Typography>
                            <Typography variant={'caption'} style={{ color: racialColor }}>
                                Radicals
                            </Typography>
                        </Box>

                        <Box className={classes.subjectsLabel} >
                            <Typography variant={'body1'}>
                                <FractionText top={progressData.kanji.passed}
                                    bottom={progressData.kanji.total}
                                />
                            </Typography>
                            <Typography variant={'caption'} style={{ color: kanjiColor }}>
                                Kanji
                            </Typography>
                        </Box>

                        <Box className={classes.subjectsLabel}>
                            <Typography variant={'body1'}>
                                <FractionText top={progressData.vocabulary.passed}
                                    bottom={progressData.vocabulary.total}
                                />
                            </Typography>
                            <Typography variant={'caption'} style={{ color: vocabularyColor }}>
                                Vocabulary
                            </Typography>
                        </Box>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default WanikaniLevelSummaryChart;