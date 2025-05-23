import { WANIKANI_COLORS } from '../../Constants';
import { Card, CardContent, CircularProgress, GridLegacy, Typography } from "@mui/material";
import { sortAndGetMedian } from "../../util/MathUtils";
import { createSubjectMap } from "../service/WanikaniDataUtil";
import { millisToDays, millisToHours } from "../../util/DateUtils";
import { distinct } from "../../util/ArrayUtils";
import { AppStyles } from "../../util/TypeUtils";
import { WanikaniSubjectReview } from "../models/WanikaniSubjectReview";
import { WanikaniReview } from "../models/WanikaniReview";
import { WanikaniSubject } from "../models/WanikaniSubject";
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

function getBurnedItems(allReviewsByType: WanikaniSubjectReview[]) {
    const burned = allReviewsByType.filter(review => review.review.endingSrsStage == 9);
    return distinct(burned, review => review.subject.id);
}

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

function formatTotalsData(reviews: WanikaniReview[], subjects: WanikaniSubject[]): FormattedData {
    const subjectsMap = createSubjectMap(subjects);
    const data: WanikaniSubjectReview[] = [];
    for (const review of reviews) {
        data.push({
            review: review,
            subject: subjectsMap[review.subjectId]
        });
    }

    const radicalsTotal = data.filter(r => r.subject?.object == 'radical');
    const radicalsDistinct = distinct(radicalsTotal, review => review.subject.id);
    const radicalsBurned = getBurnedItems(radicalsTotal);

    const kanjiTotal = data.filter(r => r.subject?.object == 'kanji');
    const kanjiDistinct = distinct(kanjiTotal, review => review.subject.id);
    const kanjiBurned = getBurnedItems(kanjiTotal);

    const vocabularyTotal = data.filter(r => r.subject?.object == 'vocabulary');
    const vocabularyDistinct = distinct(vocabularyTotal, review => review.subject.id);
    const vocabularyBurned = getBurnedItems(vocabularyTotal);

    return {
        total: data.length,
        radicals: radicalsTotal.length,
        radicalsDistinct: radicalsDistinct.length,
        radicalsBurned: radicalsBurned.length,
        kanji: kanjiTotal.length,
        kanjiDistinct: kanjiDistinct.length,
        kanjiBurned: kanjiBurned.length,
        vocabulary: vocabularyTotal.length,
        vocabularyDistinct: vocabularyDistinct.length,
        vocabularyBurned: vocabularyBurned.length,
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
    reviews: WanikaniReview[]
    subjects: WanikaniSubject[]
    levelProgress: WanikaniLevelProgression[]
    user?: WanikaniUser
};

function WanikaniHistorySummaryChart({ user, subjects, reviews, levelProgress }: WanikaniHistorySummaryChartProps) {
    const totalsData = formatTotalsData(reviews, subjects);
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
