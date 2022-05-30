import {
    Chart,
    ValueAxis,
    BarSeries,
    ScatterSeries,
    ArgumentAxis,
    Tooltip
} from '@devexpress/dx-react-chart-material-ui';
import React, {useState, useEffect, useMemo} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {ArgumentScale, EventTracker, LineSeries, Stack, ValueScale} from "@devexpress/dx-react-chart";
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addHours, truncMinutes} from '../../util/DateUtils.ts';
import {WanikaniColors} from '../../Constants.js';
import PeriodSelector from "../../shared/PeriodSelector.jsx";
import {scaleBand} from 'd3-scale';
import {
    addTimeToDate,
    createUpcomingReviewsChartBarLabel,
    createUpcomingReviewsChartLabel,
    formatTimeUnitLabelText,
    UnitSelector,
    UpcomingReviewPeriods,
    UpcomingReviewsScatterPoint,
    UpcomingReviewUnits
} from "../../util/UpcomingReviewChartUtils.jsx";
import {useDeviceInfo} from "../../hooks/useDeviceInfo.jsx";

const styles = {
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

function formatChartData(rawData, unit, period, initialReviewCount) {
    const data = rawData
        .filter(assignment => new Date(assignment.data['available_at']) > addTimeToDate(new Date(), unit, -1))
        .filter(assignment => new Date(assignment.data['available_at']) < addTimeToDate(new Date(), unit, period));

    let totalReviewCount = initialReviewCount;
    let daysData = []
    for (let i = 0; i < period; i++) {
        const date = addTimeToDate(getChartStartTime(), unit, i);
        const assignmentsOnDay = data.filter(assignment => unit.isPeriodTheSame(new Date(assignment.data['available_at']), date, unit));
        totalReviewCount += assignmentsOnDay.length;

        daysData.push({
            radicals: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'radical').length,
            kanji: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'kanji').length,
            vocabulary: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'vocabulary').length,
            reviews: assignmentsOnDay.length,
            time: date.getTime(),
            total: totalReviewCount
        });
    }
    return daysData;
}

async function fetchFutureReviews() {
    const data = await WanikaniApiService.getAllAssignments();
    return data.filter(assignment => !assignment.data['burned_at'] || !assignment.data['available_at']);
}

function getTopSeries(targetItem, chartData) {
    const dp = chartData[targetItem.point];
    if (dp.vocabulary > 0)
        return 'vocabulary';
    else if (dp.kanji > 0)
        return 'kanji';
    else
        return 'radicals'
}

function WanikaniUpcomingReviewsChart() {
    const [rawData, setRawData] = useState([]);
    const [initialReviewCount, setInitialReviewCount] = useState(0);
    const [targetItem, setTargetItem] = useState();
    const [unit, setUnit] = useState(UpcomingReviewUnits.hours);
    const [period, setPeriod] = useState(48);
    const {isMobile} = useDeviceInfo();

    useEffect(() => {
        let isSubscribed = true;
        fetchFutureReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
            });
        WanikaniApiService.getPendingLessonsAndReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setInitialReviewCount(data.reviews);
            });
        return () => isSubscribed = false;
    }, []);

    const chartData = useMemo(
        () => !rawData || rawData.length == 0 ? [] : formatChartData(rawData, unit, period, initialReviewCount),
        [rawData, unit.key, period, initialReviewCount]
    );

    const maxScale = useMemo(() => {
        const totals = chartData.map(dp => dp.radicals + dp.kanji + dp.vocabulary)
        return Math.max(5, ...totals) + 5;
    }, [chartData]);

    const ReviewsToolTip = useMemo(() => (
        function ReviewsToolTip({targetItem}) {
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
                                    color={WanikaniColors.blue}
                                    pointComponent={BarWithLabel}
                                    scaleName="daily"
                                />

                                <BarSeries
                                    name="kanji"
                                    valueField="kanji"
                                    argumentField="time"
                                    color={WanikaniColors.pink}
                                    pointComponent={BarWithLabel}
                                    scaleName="daily"
                                />

                                <BarSeries
                                    name="vocabulary"
                                    valueField="vocabulary"
                                    argumentField="time"
                                    color={WanikaniColors.purple}
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

export default WanikaniUpcomingReviewsChart;
