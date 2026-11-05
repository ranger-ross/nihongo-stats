import { ArgumentAxis, Chart, Tooltip, ValueAxis } from '@devexpress/dx-react-chart-material-ui';
import React, { useMemo, useState } from "react";
import {
    ArgumentAxis as ArgumentAxisBase,
    EventTracker,
    LineSeries,
    ScatterSeries,
    ValueScale
} from "@devexpress/dx-react-chart";
import { WANIKANI_COLORS } from '../../Constants';
import { Card, CardContent, GridLegacy, Tooltip as MuiTooltip, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { scaleLinear } from 'd3-scale';
import PeriodSelector from "../../shared/PeriodSelector";
import { createSubjectMap } from "../service/WanikaniDataUtil";
import { millisToDays, truncDate } from "../../util/DateUtils";
import { WanikaniSubject } from "../models/WanikaniSubject";
import { WanikaniReviewStatistic } from "../models/WanikaniReviewStatistic";
import { WanikaniLevelProgression } from "../models/WanikaniLevelProgress";
import { ErrorBoundary } from "react-error-boundary";
import { GenericErrorMessage } from "../../shared/GenericErrorMessage";

const scale = () => scaleLinear();
const modifyDomain = () => [0, 100];

function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
    const { text } = props;
    const rawTimestamp = parseInt((text as string).split(',').join(''));
    return (
        <ArgumentAxis.Label
            {...props}
            text={new Date(rawTimestamp).toLocaleDateString()}
        />
    );
}

type PercentageLabelProps = ValueAxis.LabelProps

function PercentageLabel(props: PercentageLabelProps) {
    const { text } = props;
    return (
        <ValueAxis.Label
            {...props}
            text={text + '%'}
        />
    );
}

type LevelDataPoint = {
    date: Date,
    level: number,
    ratio: number,
};

// Reviews are no longer available, so each level's lifetime answer accuracy
// is plotted on the date that level was unlocked.
function fetchData(reviewStatistics: WanikaniReviewStatistic[], subjects: WanikaniSubject[], levelProgress: WanikaniLevelProgression[]): LevelDataPoint[] {
    const subjectMap = createSubjectMap(subjects);
    const answers: { [level: number]: { correct: number, total: number } } = {};
    for (const statistic of reviewStatistics) {
        const level = subjectMap[statistic.subjectId]?.level;
        if (!level) {
            continue;
        }
        const correct = statistic.meaningCorrect + statistic.readingCorrect;
        const incorrect = statistic.meaningIncorrect + statistic.readingIncorrect;
        answers[level] ??= { correct: 0, total: 0 };
        answers[level].correct += correct;
        answers[level].total += correct + incorrect;
    }

    // A later progression for the same level (after a reset) replaces the earlier one
    const unlockDates: { [level: number]: Date } = {};
    for (const progression of levelProgress) {
        if (!progression.abandonedAt) {
            unlockDates[progression.level] = progression.unlockedAt ?? progression.createdAt;
        }
    }

    return Object.entries(unlockDates)
        .map(([level, date]) => ({ level: Number(level), date }))
        .filter(({ level }) => answers[level]?.total > 0)
        .map(({ level, date }) => ({
            date,
            level,
            ratio: Number(((answers[level].correct / answers[level].total) * 100).toFixed(2)),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getTotalDays() {
    const firstDate = truncDate(new Date(2000, 0, 1));
    const today = truncDate(Date.now());
    const difference = today.getTime() - firstDate.getTime();
    return millisToDays(difference);
}

const totalDays = getTotalDays();

function useData(reviewStatistics: WanikaniReviewStatistic[], subjects: WanikaniSubject[], levelProgress: WanikaniLevelProgression[], daysToLookBack: number) {
    const rawData = useMemo(() => fetchData(reviewStatistics, subjects, levelProgress), [reviewStatistics, subjects, levelProgress]);

    return useMemo(() => rawData.filter(dp => dp.date.getTime() > (Date.now() - (1000 * 3600 * 24 * daysToLookBack))),
        [rawData, daysToLookBack]);
}

type WanikaniAccuracyHistoryChartProps = {
    reviewStatistics: WanikaniReviewStatistic[]
    subjects: WanikaniSubject[]
    levelProgress: WanikaniLevelProgression[]
};

function WanikaniAccuracyHistoryChart({ reviewStatistics, subjects, levelProgress }: WanikaniAccuracyHistoryChartProps) {
    const [daysToLookBack, setDaysToLookBack] = useState(totalDays);
    const data = useData(reviewStatistics, subjects, levelProgress, daysToLookBack);

    function AccuracyToolTip({ targetItem }: Tooltip.ContentProps) {
        const dataPoint = data[targetItem.point];
        return (
            <>
                <p>Level {dataPoint.level}</p>
                <p>Unlocked: {dataPoint.date.toLocaleDateString()}</p>
                <p>Accuracy: {dataPoint.ratio}%</p>
            </>
        );
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <GridLegacy container>
                        <GridLegacy item xs={12} md={4} />
                        <GridLegacy item xs={12} md={4}>
                            <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                                Review Accuracy
                            </Typography>
                        </GridLegacy>

                        <GridLegacy item xs={12} md={4} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                            <PeriodSelector period={daysToLookBack}
                                setPeriod={setDaysToLookBack}
                                options={[
                                    { value: 7, text: '7' },
                                    { value: 14, text: '14' },
                                    { value: 30, text: '30' },
                                    { value: 90, text: '3 Mon' },
                                    { value: 180, text: '6 Mon' },
                                    { value: 365, text: '1 Yr' },
                                    { value: totalDays, text: 'All' },
                                ]}
                            />
                            <MuiTooltip title={'Lifetime accuracy of each level\'s items, shown on the date the level was unlocked'}>
                                <InfoOutlined fontSize={'small'} />
                            </MuiTooltip>
                        </GridLegacy>

                    </GridLegacy>

                    <div style={{ flexGrow: '1' }}>
                        <Chart data={data}>
                            <ValueScale factory={scale} modifyDomain={modifyDomain} />
                            <ValueAxis labelComponent={PercentageLabel} />
                            <ArgumentAxis labelComponent={LabelWithDate} />
                            <LineSeries
                                name="Level Accuracy Line"
                                valueField="ratio"
                                argumentField="date"
                                color={WANIKANI_COLORS.blue}
                            />
                            <ScatterSeries
                                name="Level Accuracy"
                                valueField="ratio"
                                argumentField="date"
                                color={WANIKANI_COLORS.blue}
                            />

                            <EventTracker />
                            <Tooltip contentComponent={AccuracyToolTip} />
                        </Chart>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Wrapper to catch any errors
function WanikaniAccuracyHistoryChartErrorWrapper(props: WanikaniAccuracyHistoryChartProps) {
    return (
        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
            <WanikaniAccuracyHistoryChart {...props} />
        </ErrorBoundary>
    );
}

export default WanikaniAccuracyHistoryChartErrorWrapper;
