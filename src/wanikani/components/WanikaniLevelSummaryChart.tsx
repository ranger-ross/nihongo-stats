import {Box, Card, CardContent, CircularProgress, Grid, Stack, Tooltip, Typography} from "@mui/material";
import {millisToDays, millisToHours} from '../../util/DateUtils';
import {WanikaniColors} from "../../Constants";
import {AppStyles} from "../../util/TypeUtils";
import {WanikaniLevelProgression} from "../models/WanikaniLevelProgress";
import {WanikaniUser} from "../models/WanikaniUser";
import {WanikaniSubject} from "../models/WanikaniSubject";
import {WanikaniAssignment} from "../models/WanikaniAssignment";
import {createSubjectMap} from "../service/WanikaniDataUtil";


const racialColor = WanikaniColors.blue;
const kanjiColor = WanikaniColors.pink;
const vocabularyColor = WanikaniColors.purple;

const styles: AppStyles = {
    container: {
        width: '100%',
        aspectRatio: `${1 / 0.9}`
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

type SubjectProgress = {
    passed: number,
    total: number,
    started: number,
};

type ProgressData = {
    isLoading: boolean,
    timeOnLevel: number,
    radicals: SubjectProgress,
    kanji: SubjectProgress,
    vocabulary: SubjectProgress,
    level: number,
};

const defaultData: ProgressData = {
    isLoading: true,
    timeOnLevel: 0,
    level: 0,
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

function FractionText({top, bottom}: { top: string | number, bottom: string | number }) {
    return (
        <>
            <sup>{top}</sup>&frasl;<sub>{bottom}</sub>
        </>
    );
}

function getLevelProgress(levelsProgress: WanikaniLevelProgression[], currentLevel: number) {
    const currentLevelAttempts = levelsProgress.filter(lvl => lvl.level === currentLevel);
    return currentLevelAttempts[currentLevelAttempts.length - 1]
}

function getCurrentLevelProgressData(
    levelsProgress: WanikaniLevelProgression[],
    allSubjects: WanikaniSubject[],
    assignments: WanikaniAssignment[],
    user?: WanikaniUser
): ProgressData {
    if (!user || levelsProgress.length === 0 || allSubjects.length === 0 || assignments.length === 0)
        return defaultData;

    const currentLevel = user.level;

    const currentLevelProgress = getLevelProgress(levelsProgress, currentLevel);

    let start;
    if (currentLevel > 1) {
        const previousLevelProgress = getLevelProgress(levelsProgress, currentLevel - 1);
        start = previousLevelProgress.passedAt;
    } else {
        start = currentLevelProgress.startedAt;
    }

    const end = currentLevelProgress.passedAt ?? new Date();
    const timeOnLevel = end.getTime() - (start as Date).getTime()

    const subjects = allSubjects.filter(subject => subject.level === currentLevel);

    const radicalsTotal = subjects.filter(s => s.object === 'radical');
    const radicals = assignments.filter(s => s.subjectType === 'radical' && !!s.passedAt);
    const radicalsStarted = assignments.filter(s => s.subjectType === 'radical' && !!s.startedAt);
    const kanjiTotal = subjects.filter(s => s.object === 'kanji');
    const kanji = assignments.filter(s => s.subjectType === 'kanji' && !!s.passedAt);
    const kanjiStarted = assignments.filter(s => s.subjectType === 'kanji' && !!s.startedAt);
    const vocabularyTotal = subjects.filter(s => s.object === 'vocabulary');
    const vocabulary = assignments.filter(s => s.subjectType === 'vocabulary' && !!s.passedAt);
    const vocabularyStarted = assignments.filter(s => s.subjectType === 'vocabulary' && !!s.startedAt);

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
        }
    };
}

type SubjectProgressLabelProps = {
    started: number,
    passed: number,
    total: number,
    name: string,
    color: string,
};

function SubjectProgressLabel({started, passed, total, name, color}: SubjectProgressLabelProps) {
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

function getAssignmentsForCurrentLevel(
    subjects: WanikaniSubject[],
    assignments: WanikaniAssignment[],
    user?: WanikaniUser
) {
    if (!user || subjects.length === 0 || assignments.length === 0)
        return [];

    const sub = createSubjectMap(subjects);

    return assignments.filter(assignment => {
        const s = sub[assignment.subjectId];
        return s.level === user.level;
    });
}

type WanikaniLevelSummaryChartProps = {
    user?: WanikaniUser
    levelsProgress: WanikaniLevelProgression[]
    subjects: WanikaniSubject[]
    assignments: WanikaniAssignment[]
};

function WanikaniLevelSummaryChart({levelsProgress, user, subjects, assignments}: WanikaniLevelSummaryChartProps) {
    const assignmentsForCurrentLevel = getAssignmentsForCurrentLevel(subjects, assignments, user);
    const progressData = getCurrentLevelProgressData(levelsProgress, subjects, assignmentsForCurrentLevel, user);
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
