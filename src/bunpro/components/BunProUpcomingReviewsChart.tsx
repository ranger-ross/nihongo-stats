import React, {useMemo, useState} from "react";
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addHours, truncMinutes} from '../../util/DateUtils';
import PeriodSelector from "../../shared/PeriodSelector";
import {createGrammarPointsLookupMap, filterDeadGhostReviews} from "../service/BunProDataUtil";
import {ArgumentAxis, Chart, ScatterSeries, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {
    ArgumentScale,
    BarSeries,
    EventTracker,
    LineSeries,
    SeriesRef,
    Stack,
    ValueScale
} from "@devexpress/dx-react-chart";
import FilterableLegend from "../../shared/FilterableLegend";
import {
    addTimeToDate,
    createUpcomingReviewsChartBarLabel,
    createUpcomingReviewsChartLabel,
    formatTimeUnitLabelText,
    UnitSelector,
    UpcomingReviewPeriods,
    UpcomingReviewsScatterPoint,
    UpcomingReviewUnit,
    UpcomingReviewUnits
} from "../../util/UpcomingReviewChartUtils";
import {useDeviceInfo} from "../../hooks/useDeviceInfo";
import {AppStyles} from "../../util/TypeUtils";
import {scaleBand} from "../../util/ChartUtils";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import {BunProReview} from "../models/BunProReview";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

const styles: AppStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
        alignItems: 'center'
    }
};

type DataPoint = {
    date: number,
    [k: string]: number
};

function createEmptyDataPoint(date: Date): DataPoint {
    const emptyDataPoint: DataPoint = {
        date: date.getTime(),
    };
    JLPTLevels.forEach(level => emptyDataPoint[level] = 0)
    return emptyDataPoint;
}

function getChartStartTime() { // Start chart at the beginning of the next hour
    return addHours(truncMinutes(new Date()), 1);
}

function aggregateData(reviews: BpReviewAndGp[], unit: UpcomingReviewUnit, period: number, pendingReviews: number): DataPoint[] {
    const data: DataPoint[] = [];

    for (let i = 0; i < period; i++) {
        const date = addTimeToDate(getChartStartTime(), unit, i);
        const reviewsInPeriod = reviews.filter(review => unit.isPeriodTheSame(unit.trunc(review.nextReview ?? new Date()), date));

        const dp = createEmptyDataPoint(date);

        for (const review of reviewsInPeriod) {
            const level = review.grammarPoint.level.replace('JLPT', 'N');
            if (!!dp[level]) {
                dp[level] += 1;
            } else {
                dp[level] = 1;
            }
        }

        let total = JLPTLevels.map(level => dp[level]).reduce((a, c) => a + c);
        if (data.length > 0)
            total += data[data.length - 1].total;
        else
            total += pendingReviews;

        dp.total = total;
        data.push(dp);
    }

    return data;
}

type BpReviewAndGp = BunProReview & {
    grammarPoint: BunProGrammarPoint
};

function useData(grammarPoints?: BunProGrammarPoint[], reviews?: BunProReview[], ghostReviews?: BunProReview[]): BpReviewAndGp[] {
    if (!grammarPoints || !reviews || !ghostReviews)
        return [];
    const grammarPointsMap = createGrammarPointsLookupMap(grammarPoints);

    return [...reviews, ...ghostReviews]
        .filter(filterDeadGhostReviews)
        .map((review: BunProReview) => ({
            ...review,
            grammarPoint: grammarPointsMap[review.grammarPointId]
        }))
        .sort((a, b) => (a.nextReview?.getTime() ?? 0) - (b.nextReview?.getTime() ?? 0));
}

type BunProUpcomingReviewsChartProps = {
    grammarPoints?: BunProGrammarPoint[],
    reviews?: BunProReview[],
    ghostReviews?: BunProReview[],
    pendingReviewsCount: number
};

function BunProUpcomingReviewsChart({
                                        reviews,
                                        grammarPoints,
                                        ghostReviews,
                                        pendingReviewsCount
                                    }: BunProUpcomingReviewsChartProps) {
    const rawData = useData(grammarPoints, reviews, ghostReviews);
    const [targetItem, setTargetItem] = useState<SeriesRef>();
    const [period, setPeriod] = useState(UpcomingReviewUnits.hours.default);
    const [unit, setUnit] = useState(UpcomingReviewUnits.hours);
    const {isMobile} = useDeviceInfo();

    const chartData = useMemo(
        () => aggregateData(rawData, unit, period, pendingReviewsCount),
        [rawData, period, unit, pendingReviewsCount]
    );

    const maxScale = useMemo(() => {
        const totals = chartData.map(dp => JLPTLevels.map(level => dp[level]).reduce((a, c) => a + c))
        return Math.max(5, ...totals) * 1.15;
    }, [chartData]);

    const BarWithLabel = useMemo(() => {
        return createUpcomingReviewsChartBarLabel((seriesIndex, index) => {
            const dp = chartData[index];

            if (dp.N1 > 0)
                return seriesIndex === 5;

            if (dp.N2 > 0)
                return seriesIndex === 3;

            if (dp.N3 > 0)
                return seriesIndex === 2;

            if (dp.N4 > 0)
                return seriesIndex === 1;

            if (dp.N5 > 0)
                return seriesIndex === 0;

            return false;
        });
    }, [chartData])

    // @ts-ignore
    const getTopSeries: (targetItem: SeriesRef) => string = useMemo(() => (targetItem: SeriesRef) => {
        return [...JLPTLevels].reverse().find(level => chartData[targetItem.point][level] > 0);
    }, [chartData]);

    const LabelWithDate = useMemo(() => createUpcomingReviewsChartLabel(unit, isMobile), [unit.key, isMobile]);

    const ReviewsToolTip = useMemo(() => (
        function ReviewsToolTip({targetItem}: Tooltip.ContentProps) {
            const dp = chartData[targetItem.point];
            const rowStyle = {display: 'flex', justifyContent: 'space-between', gap: '10px'};

            const isTotal = !targetItem.series.startsWith('N');
            return (
                <>
                    <div style={rowStyle}>
                        <div>{unit.key == UpcomingReviewUnits.hours.key ? 'Time' : 'Date'}:</div>
                        <div>{formatTimeUnitLabelText(unit, dp.date, true).primary}</div>
                    </div>

                    {isTotal ? (
                        <div style={rowStyle}>
                            <div>Total:</div>
                            <div>{dp.total}</div>
                        </div>
                    ) : (
                        JLPTLevels.map(level => (
                            dp[level] ? (
                                <div key={level} style={rowStyle}>
                                    <div>{level}:</div>
                                    <div>{dp[level]}</div>
                                </div>
                            ) : null
                        ))
                    )}
                </>
            );
        }
    ), [chartData]);

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={styles.container}>
                    <div style={styles.headerContainer}>

                        <UnitSelector
                            unit={unit}
                            onChange={unit => {
                                setPeriod(unit.default);
                                setUnit(unit);
                            }}
                            options={[
                                UpcomingReviewUnits.hours,
                                UpcomingReviewUnits.days,
                            ]}
                        />

                        <Typography variant={'h6'} align={'center'}>
                            Upcoming Reviews
                        </Typography>

                        <PeriodSelector period={period}
                                        setPeriod={setPeriod}
                                        options={unit === UpcomingReviewUnits.days ?
                                            UpcomingReviewPeriods.days : UpcomingReviewPeriods.hours}
                        />
                    </div>

                    {rawData.length === 0 ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%'}}>
                            <CircularProgress/>
                        </div>
                    ) : (
                        <div style={{flexGrow: '1'}}>
                            <Chart data={chartData}>

                                <ValueScale name="total"
                                            modifyDomain={() => [0, chartData.length > 0 ? chartData[chartData.length - 1].total : 1]}/>

                                <ValueScale name="daily"
                                            modifyDomain={() => [0, maxScale]}/>

                                <ValueAxis scaleName="total"/>
                                <ArgumentScale factory={scaleBand}/>
                                <ArgumentAxis labelComponent={LabelWithDate}/>

                                {JLPTLevels.map(level => (
                                    <BarSeries
                                        key={level}
                                        name={level}
                                        valueField={level}
                                        argumentField="date"
                                        scaleName="daily"
                                        pointComponent={BarWithLabel}
                                    />
                                ))}

                                <LineSeries
                                    name="Total"
                                    valueField="total"
                                    argumentField="date"
                                    color={'#a45bff'}
                                    scaleName="total"
                                />

                                <ScatterSeries
                                    name="total-points"
                                    valueField="total"
                                    argumentField="date"
                                    color={'#a45bff'}
                                    scaleName="total"
                                    pointComponent={UpcomingReviewsScatterPoint}
                                />

                                <Stack
                                    stacks={[{series: JLPTLevels}]}
                                />

                                <FilterableLegend
                                    filterItems={[
                                        'total-points'
                                    ]}
                                    position={isMobile ? 'bottom' : 'right'}
                                />
                                <EventTracker/>
                                <Tooltip targetItem={!!targetItem && !targetItem.series.toLowerCase().includes('total')
                                    ? {...targetItem, series: getTopSeries(targetItem)} : targetItem}
                                         onTargetItemChange={setTargetItem}
                                         contentComponent={ReviewsToolTip}
                                />
                            </Chart>
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    );
}

export default BunProUpcomingReviewsChart;
