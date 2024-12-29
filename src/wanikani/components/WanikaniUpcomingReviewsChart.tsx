import {
    ArgumentAxis,
    BarSeries,
    Chart,
    ScatterSeries,
    Tooltip,
    ValueAxis
} from '@devexpress/dx-react-chart-material-ui';
import React, {useMemo, useState} from "react";
import {ArgumentScale, EventTracker, LineSeries, SeriesRef, Stack, ValueScale} from "@devexpress/dx-react-chart";
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addHours, truncMinutes} from '../../util/DateUtils';
import {WANIKANI_COLORS} from '../../Constants';
import PeriodSelector from "../../shared/PeriodSelector";
import {scaleBand} from '../../util/ChartUtils'
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
import {WanikaniAssignment} from "../models/WanikaniAssignment";
import {WanikaniSummary} from "../models/WanikaniSummary";
import {getPendingLessonsAndReviews} from "../service/WanikaniDataUtil";
import {ErrorBoundary} from "react-error-boundary";
import {GenericErrorMessage} from "../../shared/GenericErrorMessage";

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

function getChartStartTime() { // Start chart at the beginning of the next hour
    return addHours(truncMinutes(new Date()), 1);
}

type FormattedDataPoint = {
    radicals: number,
    kanji: number,
    vocabulary: number,
    reviews: number,
    time: number,
    total: number
};

function formatChartData(rawData: WanikaniAssignment[], unit: UpcomingReviewUnit, period: number, initialReviewCount: number): FormattedDataPoint[] {
    const data = rawData
        .filter(assignment => (assignment.availableAt as Date)?.getTime() > addTimeToDate(new Date(), unit, -1).getTime())
        .filter(assignment => (assignment.availableAt as Date)?.getTime() < addTimeToDate(new Date(), unit, period).getTime());

    let totalReviewCount = initialReviewCount;
    const daysData = []
    for (let i = 0; i < period; i++) {
        const date = addTimeToDate(getChartStartTime(), unit, i);
        const assignmentsOnDay = data.filter(assignment => unit.isPeriodTheSame(assignment.availableAt as Date, date));
        totalReviewCount += assignmentsOnDay.length;

        daysData.push({
            radicals: assignmentsOnDay.filter(assignment => assignment.subjectType === 'radical').length,
            kanji: assignmentsOnDay.filter(assignment => assignment.subjectType === 'kanji').length,
            vocabulary: assignmentsOnDay.filter(assignment => assignment.subjectType === 'vocabulary').length,
            reviews: assignmentsOnDay.length,
            time: date.getTime(),
            total: totalReviewCount
        });
    }
    return daysData;
}

function fetchFutureReviews(assignments: WanikaniAssignment[]) {
    return assignments.filter(assignment => !assignment.burnedAt || !assignment.availableAt);
}

function getTopSeries(targetItem: SeriesRef, chartData: FormattedDataPoint[]) {
    const dp = chartData[targetItem.point];
    if (dp.vocabulary > 0)
        return 'vocabulary';
    else if (dp.kanji > 0)
        return 'kanji';
    else
        return 'radicals'
}

type WanikaniUpcomingReviewsChartProps = {
    assignments: WanikaniAssignment[]
    summary?: WanikaniSummary
};

function WanikaniUpcomingReviewsChart({assignments, summary}: WanikaniUpcomingReviewsChartProps) {
    const pendingReviewCount = summary ? getPendingLessonsAndReviews(summary).reviews : 0
    const rawData = fetchFutureReviews(assignments);
    const [targetItem, setTargetItem] = useState<SeriesRef>();
    const [unit, setUnit] = useState(UpcomingReviewUnits.hours);
    const [period, setPeriod] = useState(48);
    const {isMobile} = useDeviceInfo();

    const chartData = useMemo(
        () => !rawData || rawData.length == 0 ? [] : formatChartData(rawData, unit, period, pendingReviewCount),
        [rawData, unit.key, period, pendingReviewCount]
    );

    const maxScale = useMemo(() => {
        const totals = chartData.map(dp => dp.radicals + dp.kanji + dp.vocabulary)
        return Math.max(5, ...totals) + 5;
    }, [chartData]);

    const ReviewsToolTip = useMemo(() => (
        function ReviewsToolTip({targetItem}: { targetItem: SeriesRef }) {
            const {radicals, kanji, vocabulary, total, time} = chartData[targetItem.point];
            const rowStyle = {display: 'flex', justifyContent: 'space-between', gap: '10px'};
            return (
                <div>
                    <div style={rowStyle}>
                        <div>{unit.key === UpcomingReviewUnits.hours.key ? 'Time' : 'Date'}:</div>
                        <div>{formatTimeUnitLabelText(unit, time, true).primary}</div>
                    </div>
                    {targetItem.series.includes('total') ? (
                        <div style={rowStyle}>
                            <div>Total:</div>
                            <div>{total}</div>
                        </div>
                    ) : (
                        <>
                            <div style={rowStyle}>
                                <div>Radicals:</div>
                                <div>{radicals}</div>
                            </div>
                            <div style={rowStyle}>
                                <div>Kanji:</div>
                                <div>{kanji}</div>
                            </div>
                            <div style={rowStyle}>
                                <div>Vocabulary:</div>
                                <div>{vocabulary}</div>
                            </div>
                        </>
                    )}
                </div>
            );
        }
    ), [chartData]);

    const LabelWithDate = useMemo(() => createUpcomingReviewsChartLabel(unit, isMobile), [unit.key, isMobile]);

    const BarWithLabel = useMemo(() => {
        return createUpcomingReviewsChartBarLabel((seriesIndex, index) => {
            if (seriesIndex === 2)
                return true;

            if (seriesIndex === 1)
                return chartData[index].vocabulary === 0;

            if (seriesIndex === 0)
                return chartData[index].kanji === 0 && chartData[index].vocabulary === 0;
            return false;
        });
    }, [chartData]);

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

                    {chartData.length === 0 ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%'}}>
                            <CircularProgress/>
                        </div>
                    ) : (
                        <div style={{flexGrow: '1'}}>
                            <Chart data={chartData} {...(isMobile ? {height: 200} : {})}>

                                <ValueScale name="total"
                                            modifyDomain={() => [0, chartData.length > 0 ? chartData[chartData.length - 1].total : 1]}/>

                                <ValueScale name="daily"
                                            modifyDomain={() => [0, maxScale]}/>

                                <ValueAxis position={'left'} scaleName="total"/>

                                <ArgumentScale factory={scaleBand}/>
                                <ArgumentAxis labelComponent={LabelWithDate}/>

                                <BarSeries
                                    name="radicals"
                                    valueField="radicals"
                                    argumentField="time"
                                    color={WANIKANI_COLORS.blue}
                                    pointComponent={BarWithLabel}
                                    scaleName="daily"
                                />

                                <BarSeries
                                    name="kanji"
                                    valueField="kanji"
                                    argumentField="time"
                                    color={WANIKANI_COLORS.pink}
                                    pointComponent={BarWithLabel}
                                    scaleName="daily"
                                />

                                <BarSeries
                                    name="vocabulary"
                                    valueField="vocabulary"
                                    argumentField="time"
                                    color={WANIKANI_COLORS.purple}
                                    pointComponent={BarWithLabel}
                                    scaleName="daily"
                                />


                                <LineSeries
                                    name="total"
                                    valueField="total"
                                    argumentField="time"
                                    color={'#e0b13e'}
                                    scaleName="total"
                                />

                                <ScatterSeries
                                    name="total-points"
                                    valueField="total"
                                    argumentField="time"
                                    color={'#e0b13e'}
                                    scaleName="total"
                                    pointComponent={UpcomingReviewsScatterPoint}
                                />

                                <Stack
                                    stacks={[{series: ['radicals', 'kanji', 'vocabulary']}]}
                                />

                                <EventTracker/>
                                <Tooltip targetItem={!!targetItem && !targetItem.series.includes('total')
                                    ? {...targetItem, series: getTopSeries(targetItem, chartData)} : targetItem}
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

// Wrapper to catch any errors
function WanikaniUpcomingReviewsChartErrorWrapper(props: WanikaniUpcomingReviewsChartProps) {
    return (
        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
            <WanikaniUpcomingReviewsChart {...props} />
        </ErrorBoundary>
    );
}

export default WanikaniUpcomingReviewsChartErrorWrapper;
