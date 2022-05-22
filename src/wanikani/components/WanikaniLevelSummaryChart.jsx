import {useState, useEffect} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {Box, Card, CardContent, Typography, Grid, Tooltip} from "@mui/material";
import {millisToDays, millisToHours} from '../../util/DateUtils.js';
import {Stack} from '@mui/material';
import {WanikaniColors} from "../../Constants.js";
import {CircularProgress} from '@mui/material'


const racialColor = WanikaniColors.blue;
const kanjiColor = WanikaniColors.pink;
const vocabularyColor = WanikaniColors.purple;

const styles = {
    container: {
        width: '100%',
        aspectRatio: 1 / 0.9
    },
    levelLabelContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: '49px'
    },
    subjectsLabel: {
        marginLeft: '5px',
        marginRight: '5px',
        textAlign: 'center'
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '240px'
    }
};

const defaultData = {
    isLoading: true,
    timeOnLevel: 0,
    timeLeft: 0,
    radicals: {
        passed: 0,
        total: 0,
        started: 0,
    },
    kanji: {
        passed: 0,
        total: 0,
        started: 0,
    },
    vocabulary: {
        passed: 0,
        total: 0,
        started: 0,
    },
};

function FractionText({top, bottom}) {
    return (
        <>
            <sup>{top}</sup>&frasl;<sub>{bottom}</sub>
        </>
    );
}

function getLevelProgress(levelsProgress, currentLevel) {
    const currentLevelAttempts = levelsProgress.filter(lvl => lvl.data.level === currentLevel);
    return currentLevelAttempts[currentLevelAttempts.length - 1].data
}

async function getCurrentLevelProgressData() {
    const userData = await WanikaniApiService.getUser();

    const currentLevel = userData.data.level;

    const levelsProgress = await WanikaniApiService.getLevelProgress();
    const currentLevelProgress = getLevelProgress(levelsProgress.data, currentLevel);

    let start;
    if (currentLevel > 1) {
        const previousLevelProgress = getLevelProgress(levelsProgress.data, currentLevel - 1);
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
    const radicalsStarted = assignments.data.filter(s => s.data['subject_type'] === 'radical' && !!s.data['started_at']);
    const kanjiTotal = subjects.filter(s => s.object === 'kanji');
    const kanji = assignments.data.filter(s => s.data['subject_type'] === 'kanji' && !!s.data['passed_at']);
    const kanjiStarted = assignments.data.filter(s => s.data['subject_type'] === 'kanji' && !!s.data['started_at']);
    const vocabularyTotal = subjects.filter(s => s.object === 'vocabulary');
    const vocabulary = assignments.data.filter(s => s.data['subject_type'] === 'vocabulary' && !!s.data['passed_at']);
    const vocabularyStarted = assignments.data.filter(s => s.data['subject_type'] === 'vocabulary' && !!s.data['started_at']);

    return {
        isLoading: false,
        level: currentLevel,
        timeOnLevel: timeOnLevel,
        radicals: {
            passed: radicals.length,
            total: radicalsTotal.length,
            started: radicalsStarted.length,
        },
        kanji: {
            passed: kanji.length,
            total: kanjiTotal.length,
            started: kanjiStarted.length,
        },
        vocabulary: {
            passed: vocabulary.length,
            total: vocabularyTotal.length,
            started: vocabularyStarted.length,
        },
    };
}

function SubjectProgressLabel({started, passed, total, name, color}) {
    return (
        <Tooltip title={
            <span>
                <p>Started: {started}</p>
                <p>Passed: {passed}</p>
            </span>
        } placement={'top'}>
            <Box style={styles.subjectsLabel}>
                <Typography variant={'body1'}>
                    <FractionText top={passed}
                                  bottom={total}
                    />
                </Typography>
                <Typography variant={'caption'} style={{
                    color: color,
                    textShadow: '2px 2px 5px #000000aa'
                }}>
                    {name}
                </Typography>
            </Box>

        </Tooltip>
    );
}


function WanikaniLevelSummaryChart() {
    const [progressData, setProgressData] = useState(defaultData);

    useEffect(() => {
        let isSubscribed = true;
        getCurrentLevelProgressData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setProgressData(data);
            })
            .catch(console.error)
        return () => isSubscribed = false;
    }, []);

    return (
        <Card style={styles.container}>
            <CardContent style={{height: '100%'}}>

                <Stack height={'100%'}>
                    {progressData.isLoading ? (
                        <Box sx={{flexGrow: 1}} style={styles.spinnerContainer}>
                            <CircularProgress/>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{flexGrow: 1}} style={styles.levelLabelContainer}>
                                <Typography variant={'h2'} style={{textAlign: 'center'}}>
                                    {progressData.level}
                                </Typography>
                                <Typography variant={'caption'} style={{textAlign: 'center'}}>
                                    Level
                                </Typography>
                            </Box>

                            <Grid item container alignItems={'center'}>
                                <Box style={{textAlign: 'center'}}>
                                    <Tooltip title={
                                        <span>
                                            <p>Days: {millisToDays(progressData.timeOnLevel)}</p>
                                            <p>Hours: {millisToHours(progressData.timeOnLevel) % 24}</p>
                                        </span>
                                    } placement={'top'}>
                                        <Typography variant={'body1'} style={{fontWeight: 'bold'}}>
                                            {millisToDays(progressData.timeOnLevel)}
                                        </Typography>
                                    </Tooltip>
                                    <Typography variant={'caption'}>
                                        Days on level
                                    </Typography>
                                </Box>

                                <Box sx={{flexGrow: 1}}/>

                                <SubjectProgressLabel name={'Radicals'}
                                                      total={progressData.radicals.total}
                                                      started={progressData.radicals.started}
                                                      passed={progressData.radicals.passed}
                                                      color={racialColor}
                                />

                                <SubjectProgressLabel name={'Kanji'}
                                                      total={progressData.kanji.total}
                                                      started={progressData.kanji.started}
                                                      passed={progressData.kanji.passed}
                                                      color={kanjiColor}
                                />

                                <SubjectProgressLabel name={'Vocabulary'}
                                                      total={progressData.vocabulary.total}
                                                      started={progressData.vocabulary.started}
                                                      passed={progressData.vocabulary.passed}
                                                      color={vocabularyColor}
                                />

                            </Grid>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default WanikaniLevelSummaryChart;
