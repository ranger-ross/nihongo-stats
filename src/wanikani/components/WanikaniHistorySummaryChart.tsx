import { WANIKANI_COLORS } from '../../Constants';
import { Card, CardContent, CircularProgress, GridLegacy, Typography } from "@mui/material";
import { sortAndGetMedian } from "../../util/MathUtils";
import { millisToDays, millisToHours } from "../../util/DateUtils";
import { AppStyles } from "../../util/TypeUtils";
import { WanikaniAssignment } from "../models/WanikaniAssignment";
import { WanikaniReviewStatistic } from "../models/WanikaniReviewStatistic";
import { WanikaniSubjectType } from "../models/WanikaniSubject";
import { WanikaniLevelProgression } from "../models/WanikaniLevelProgress";
import { WanikaniUser } from "../models/WanikaniUser";
import { ErrorBoundary } from "react-error-boundary";
import { GenericErrorMessage } from "../../shared/GenericErrorMessage";
import React from "react";

const styles: AppStyles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        margin: '20px',
        minHeight: '100px'
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
};

type FormattedData = {
    total: number,
    radicals: number,
    radicalsDistinct: number,
    radicalsBurned: number,
    kanji: number,
    kanjiDistinct: number,
    kanjiBurned: number,
    vocabulary: number,
    vocabularyDistinct: number,
    vocabularyBurned: number,
};

// Each completed review adds one correct answer per part (meaning and reading).
function reviewCount(statistic: WanikaniReviewStatistic) {
    return Math.max(statistic.meaningCorrect, statistic.readingCorrect);
}

function formatTotalsData(assignments: WanikaniAssignment[], reviewStatistics: WanikaniReviewStatistic[]): FormattedData {
    const reviewsOfType = (type: WanikaniSubjectType) => reviewStatistics
        .filter(statistic => statistic.subjectType === type)
        .reduce((sum, statistic) => sum + reviewCount(statistic), 0);
    const lessonsOfType = (type: WanikaniSubjectType) => assignments
        .filter(assignment => assignment.subjectType === type && !!assignment.startedAt)
        .length;
    const burnedOfType = (type: WanikaniSubjectType) => assignments
        .filter(assignment => assignment.subjectType === type && assignment.srsStage === 9)
        .length;

    return {
        total: reviewStatistics.reduce((sum, statistic) => sum + reviewCount(statistic), 0),
        radicals: reviewsOfType('radical'),
        radicalsDistinct: lessonsOfType('radical'),
        radicalsBurned: burnedOfType('radical'),
        kanji: reviewsOfType('kanji'),
        kanjiDistinct: lessonsOfType('kanji'),
        kanjiBurned: burnedOfType('kanji'),
        vocabulary: reviewsOfType('vocabulary'),
        vocabularyDistinct: lessonsOfType('vocabulary'),
        vocabularyBurned: burnedOfType('vocabulary'),
    };
}

type FormattedLevelData = {
    average: number,
    median: number,
    timeSinceStart: number
};

function formatLevelData(user: WanikaniUser, levelProgressData: WanikaniLevelProgression[]): FormattedLevelData {
    const timeSinceStart = Date.now() - user.startedAt.getTime();

    const levelTimes = [];
    for (const level of levelProgressData) {
        const start = level.unlockedAt?.getTime();
        const end = level.passedAt?.getTime();
        if (!start || !end) {
            continue;
        }
        levelTimes.push(end - start);
    }

    const averageInMillis = levelTimes.reduce((sum, value) => sum + value) / levelTimes.length;
    const medianInMillis = sortAndGetMedian(levelTimes);

    return {
        average: averageInMillis,
        median: medianInMillis,
        timeSinceStart
    };
}

function numberWithCommas(x: string | number) {
    if (isNaN(x as number) || x === '')
        return '';
    return parseFloat(x as string).toLocaleString();
}

type TotalLabelProps = {
    label: string,
    count: number,
    color?: string,
};

function TotalLabel({ label, count, color }: TotalLabelProps) {
    return (
        <>
            <GridLegacy item xs={6}>{label}: </GridLegacy>
            <GridLegacy item xs={6}>
                <strong style={{ color: color, textShadow: '1px 1px 3px #000000aa' }}>
                    {numberWithCommas(count)}
                </strong>
            </GridLegacy>
        </>
    );
}

type DaysAndHoursLabelProps = {
    label: string,
    milliseconds: number,
};

function DaysAndHoursLabel({ label, milliseconds }: DaysAndHoursLabelProps) {
    const days = millisToDays(milliseconds);
    const hours = millisToHours(milliseconds - (days * 1000 * 3600 * 24));
    return (
        <>
            <GridLegacy item xs={6}>{label}: </GridLegacy>
            <GridLegacy item xs={6}>
                <strong style={{ textShadow: '1px 1px 3px #000000aa' }}>
                    {days} Days {hours} Hours
                </strong>
            </GridLegacy>
        </>
    );
}


type WanikaniHistorySummaryChartProps = {
    assignments: WanikaniAssignment[]
    reviewStatistics: WanikaniReviewStatistic[]
    levelProgress: WanikaniLevelProgression[]
    user?: WanikaniUser
};

function WanikaniHistorySummaryChart({ user, assignments, reviewStatistics, levelProgress }: WanikaniHistorySummaryChartProps) {
    const totalsData = formatTotalsData(assignments, reviewStatistics);
    const levelData = !user ? null : formatLevelData(user, levelProgress);

    const isLoading = !totalsData || !levelData;

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <Typography variant={'h5'} align={'center'}>
                    History Summary
                </Typography>

                {isLoading ? (
                    <div style={styles.loadingContainer}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div style={styles.container}>
                        <GridLegacy container style={{ maxWidth: '310px', marginTop: '10px' }}>
                            <TotalLabel label={'Total Reviews'}
                                count={totalsData.total}
                            />
                            <TotalLabel label={'Radicals Reviews'}
                                count={totalsData.radicals}
                                color={WANIKANI_COLORS.blue}
                            />
                            <TotalLabel label={'Kanji Reviews'}
                                count={totalsData.kanji}
                                color={WANIKANI_COLORS.pink}
                            />
                            <TotalLabel label={'Vocabulary Reviews'}
                                count={totalsData.vocabulary}
                                color={WANIKANI_COLORS.purple}
                            />
                        </GridLegacy>

                        <GridLegacy container style={{ maxWidth: '275px', marginTop: '10px' }}>
                            <GridLegacy item xs={6} style={{ fontWeight: 'bold' }}>Total Lessons</GridLegacy>
                            <GridLegacy item xs={6} />
                            <TotalLabel label={'Radicals'}
                                count={totalsData.radicalsDistinct}
                                color={WANIKANI_COLORS.blue}
                            />
                            <TotalLabel label={'Kanji'}
                                count={totalsData.kanjiDistinct}
                                color={WANIKANI_COLORS.pink}
                            />
                            <TotalLabel label={'Vocabulary'}
                                count={totalsData.vocabularyDistinct}
                                color={WANIKANI_COLORS.purple}
                            />
                        </GridLegacy>

                        <GridLegacy container style={{ maxWidth: '275px', marginTop: '10px' }}>
                            <GridLegacy item xs={6} style={{ fontWeight: 'bold' }}>Burned Items</GridLegacy>
                            <GridLegacy item xs={6} />
                            <TotalLabel label={'Radicals'}
                                count={totalsData.radicalsBurned}
                                color={WANIKANI_COLORS.blue}
                            />
                            <TotalLabel label={'Kanji'}
                                count={totalsData.kanjiBurned}
                                color={WANIKANI_COLORS.pink}
                            />
                            <TotalLabel label={'Vocabulary'}
                                count={totalsData.vocabularyBurned}
                                color={WANIKANI_COLORS.purple}
                            />
                        </GridLegacy>

                        <GridLegacy container style={{ maxWidth: '350px', marginTop: '10px' }}>
                            <DaysAndHoursLabel label={'Time since start'} milliseconds={levelData.timeSinceStart} />
                            <DaysAndHoursLabel label={'Average Time per level'} milliseconds={levelData.average} />
                            <DaysAndHoursLabel label={'Median Time per level'} milliseconds={levelData.median} />
                        </GridLegacy>

                    </div>
                )}


            </CardContent>
        </Card>
    );
}

// Wrapper to catch any errors
function WanikaniHistorySummaryChartErrorWrapper(props: WanikaniHistorySummaryChartProps) {
    return (
        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
            <WanikaniHistorySummaryChart {...props} />
        </ErrorBoundary>
    );
}

export default WanikaniHistorySummaryChartErrorWrapper;
