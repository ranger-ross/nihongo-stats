import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Box, Card, CardContent, Typography, Grid, Tooltip } from "@mui/material";
import { millisToDays, millisToHours } from '../../util/DateUtils';
import { Stack } from '@mui/material';
import { wanikaniColors } from "../../Constants";
import { CircularProgress } from '@mui/material'


const racialColor = wanikaniColors.blue;
const kanjiColor = wanikaniColors.pink;
const vocabularyColor = wanikaniColors.purple;

const styles = {
    container: {
        width: '100%',
        aspectRatio: 1 / 0.9
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
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
};

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

async function getCurrentLevelProgressData() {
    const userData = await WanikaniApiService.getUser()

    const currentLevel = userData.data.level;

    const levelsProgress = await WanikaniApiService.getLevelProgress(currentLevel);
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

    const assignments = await WanikaniApiService.getAssignmentsForLevel(currentLevel);
    let subjects = await WanikaniApiService.getSubjects(currentLevel);
    subjects = subjects.filter(subject => subject.data.level === currentLevel);

    const radicalsTotal = subjects.filter(s => s.object === 'radical');
    const radicals = assignments.data.filter(s => s.data['subject_type'] === 'radical' && !!s.data['passed_at']);
    const kanjiTotal = subjects.filter(s => s.object === 'kanji');
    const kanji = assignments.data.filter(s => s.data['subject_type'] === 'kanji' && !!s.data['passed_at']);
    const vocabularyTotal = subjects.filter(s => s.object === 'vocabulary');
    const vocabulary = assignments.data.filter(s => s.data['subject_type'] === 'vocabulary' && !!s.data['passed_at']);

    return {
        level: currentLevel,
        timeOnLevel: timeOnLevel,
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
    const [progressData, setProgressData] = useState(defaultData);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        let isSubscribed = true;
        getCurrentLevelProgressData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setProgressData(data);
            })
            .catch(console.error)
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsLoading(false)
            });
        return () => isSubscribed = false;
    }, []);

    return (
        <Card style={styles.container}>
            <CardContent style={{ height: '100%' }}>

                <Stack height={'100%'}>
                    {isLoading ? (
                        <Box sx={{ flexGrow: 1 }} style={styles.spinnerContainer} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ flexGrow: 1 }} style={styles.daysUntilLevelContainer} >
                                <Typography variant={'h2'} style={{ textAlign: 'center' }}>
                                    {progressData.level}
                                </Typography>
                                <Typography variant={'caption'} style={{ textAlign: 'center' }}>
                                    Level
                                </Typography>
                            </Box>

                            <Grid item container alignItems={'center'}>
                                <Box style={{ textAlign: 'center' }}>
                                    <Tooltip title={
                                        <span>
                                            <p>Days: {millisToDays(progressData.timeOnLevel)}</p>
                                            <p>Hours: {millisToHours(progressData.timeOnLevel) % 24}</p>
                                        </span>
                                    } placement={'top'}>
                                        <Typography variant={'body1'} style={{ fontWeight: 'bold' }}>
                                            {millisToDays(progressData.timeOnLevel)}
                                        </Typography>
                                    </Tooltip>
                                    <Typography variant={'caption'}>
                                        Days on level
                                    </Typography>
                                </Box>

                                <Box sx={{ flexGrow: 1 }} />

                                <Box style={styles.subjectsLabel}>
                                    <Typography variant={'body1'}>
                                        <FractionText top={progressData.radicals.passed}
                                            bottom={progressData.radicals.total}
                                        />
                                    </Typography>
                                    <Typography variant={'caption'} style={{
                                        color: racialColor,
                                        textShadow: '2px 2px 5px #000000aa'
                                    }}>
                                        Radicals
                                    </Typography>
                                </Box>

                                <Box style={styles.subjectsLabel} >
                                    <Typography variant={'body1'}>
                                        <FractionText top={progressData.kanji.passed}
                                            bottom={progressData.kanji.total}
                                        />
                                    </Typography>
                                    <Typography variant={'caption'} style={{
                                        color: kanjiColor,
                                        textShadow: '2px 2px 5px #000000aa'
                                    }}>
                                        Kanji
                                    </Typography>
                                </Box>

                                <Box style={styles.subjectsLabel}>
                                    <Typography variant={'body1'}>
                                        <FractionText top={progressData.vocabulary.passed}
                                            bottom={progressData.vocabulary.total}
                                        />
                                    </Typography>
                                    <Typography variant={'caption'} style={{
                                        color: vocabularyColor,
                                        textShadow: '2px 2px 5px #000000aa'
                                    }}>
                                        Vocabulary
                                    </Typography>
                                </Box>
                            </Grid>
                        </>
                    )}
                </Stack>
            </CardContent >
        </Card >
    );
}

export default WanikaniLevelSummaryChart;