import { ArgumentAxis, Chart, Legend, Tooltip, ValueAxis } from '@devexpress/dx-react-chart-material-ui';
import React, { useMemo, useState } from "react";
import {
    ArgumentAxis as ArgumentAxisBase,
    EventTracker,
    ScatterSeries,
    SplineSeries,
    ValueScale
} from "@devexpress/dx-react-chart";
import { WANIKANI_COLORS } from '../../Constants';
import { Card, CardContent, GridLegacy, Typography } from "@mui/material";
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import PeriodSelector from "../../shared/PeriodSelector";
import { createSubjectMap } from "../service/WanikaniDataUtil";
import { millisToDays, truncDate } from "../../util/DateUtils";
import { WanikaniSubjectReview } from "../models/WanikaniSubjectReview";
import { WanikaniReview } from "../models/WanikaniReview";
import { WanikaniSubject } from "../models/WanikaniSubject";
import { useDeviceInfo } from "../../hooks/useDeviceInfo";
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

function calculateRollingAverageOfDaysInQueue(queue: DayDataPoint[]) {
    let total = 0;
    let incorrectCount = 0;

    for (const day of queue) {
        total += day.total;
        incorrectCount += day.incorrectCount;
    }

    return Number((((total - incorrectCount) / total) * 100).toFixed(2));
}

type DayDataPoint = {
    date: Date,
    ratio: number,
    total: number,
    incorrectCount: number,
    movingAverage?: number,
};

function fetchData(reviews: WanikaniReview[], subjects: WanikaniSubject[]) {
    const subjectMap = createSubjectMap(subjects);
    const data: WanikaniSubjectReview[] = [];
    for (const review of reviews) {
        data.push({
            review: review,
            subject: subjectMap[review.subjectId]
        });
    }
    const groupedData = _.groupBy(data, (v: WanikaniSubjectReview) => truncDate(v.review.createdAt));
    const groupedDataAsMap = new Map(Object.entries(groupedData));
    const result: DayDataPoint[] = Array.from(groupedDataAsMap, ([date, data]: any) => {
        const total = data.length;
        let incorrectCount = 0;
        for (const { review } of data) {
            const isIncorrect = review.incorrectMeaningAnswers > 0 || review.incorrectReadingAnswers > 0;
            if (isIncorrect)
                incorrectCount += 1;
        }

        return {
            date: new Date(date),
            ratio: Number((((total - incorrectCount) / total) * 100).toFixed(2)),
            total: total,
            incorrectCount: incorrectCount,
        };
    });

    // Calculate 7 day rolling average
    const queue: DayDataPoint[] = [];
    for (const day of result) {
        queue.push(day);

        if (queue.length > 6)
            queue.shift();

        day.movingAverage = calculateRollingAverageOfDaysInQueue(queue);
    }

    return result;
}

const ROLLING_AVERAGE_LINE_COLOR = '#ffd500';

function getTotalDays() {
    const firstDate = truncDate(new Date(2000, 0, 1));
    const today = truncDate(Date.now());
    const difference = today.getTime() - firstDate.getTime();
    return millisToDays(difference);
}

const totalDays = getTotalDays();

function useData(subjects: WanikaniSubject[], reviews: WanikaniReview[], daysToLookBack: number) {
    const rawData = fetchData(reviews, subjects);

    return useMemo(() => rawData.filter(dp => dp.date.getTime() > (Date.now() - (1000 * 3600 * 24 * daysToLookBack))),
        [rawData, daysToLookBack]);
}

type WanikaniAccuracyHistoryChartProps = {
    reviews: WanikaniReview[]
    subjects: WanikaniSubject[]
};

function WanikaniAccuracyHistoryChart({ subjects, reviews }: WanikaniAccuracyHistoryChartProps) {
    const [daysToLookBack, setDaysToLookBack] = useState(90);
    const data = useData(subjects, reviews, daysToLookBack);
    const { isMobile } = useDeviceInfo();

    function AccuracyToolTip({ targetItem }: Tooltip.ContentProps) {
        const isAverageSeries = targetItem.series.toLowerCase().includes('average');
        const dataPoint = data[targetItem.point];
        return (
            <>
                <p>{new Date(dataPoint.date).toLocaleDateString()}</p>
                {isAverageSeries ? (
                    <p>7 Day Rolling Average: {dataPoint.movingAverage}%</p>
                ) : (
                    <p>Accuracy: {dataPoint.ratio}%</p>
                )}
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

                        <GridLegacy item xs={12} md={4} style={{ textAlign: 'end' }}>
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
                        </GridLegacy>

                    </GridLegacy>

                    <div style={{ flexGrow: '1' }}>
                        <Chart data={data}>
                            <ValueScale factory={scale} modifyDomain={modifyDomain} />
                            <ValueAxis labelComponent={PercentageLabel} />
                            <ArgumentAxis labelComponent={LabelWithDate} />
                            <ScatterSeries
                                name="Daily Accuracy"
                                valueField="ratio"
                                argumentField="date"
                                color={WANIKANI_COLORS.blue}
                            />

                            <SplineSeries
                                name="7 Day Rolling Average"
                                valueField="movingAverage"
                                argumentField="date"
                                color={ROLLING_AVERAGE_LINE_COLOR}
                            />

                            <Legend position={isMobile ? 'bottom' : 'right'} />

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
