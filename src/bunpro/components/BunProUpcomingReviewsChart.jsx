import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, Checkbox, CircularProgress, Typography} from "@mui/material";
import {addHours, truncMinutes} from '../../util/DateUtils.js';
import DaysSelector from "../../shared/DaysSelector.jsx";
import {scaleBand} from 'd3-scale';
import BunProApiService from "../service/BunProApiService.js";
import {createGrammarPointsLookupMap} from "../service/BunProDataUtil.js";
import {ArgumentAxis, Chart, ScatterSeries, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {ArgumentScale, BarSeries, EventTracker, LineSeries, Stack, ValueScale} from "@devexpress/dx-react-chart";
import FilterableLegend from "../../shared/FilterableLegend.jsx";
import {
    addTimeToDate, createUpcomingReviewsChartBarLabel,
    createUpcomingReviewsChartLabel, formatTimeUnitLabelText,
    UpcomingReviewPeriods,
    UpcomingReviewUnits
} from "../../util/UpcomingReviewChartUtils.jsx";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

function filterDeadGhostReviews(review) {
    const fiveYearsFromNow = Date.now() + (1000 * 60 * 60 * 24 * 365 * 5)
    return new Date(review['next_review']).getTime() < fiveYearsFromNow;
}

function createEmptyDataPoint(date) {
    let emptyDataPoint = {
        date: date.getTime(),
    };
    JLPTLevels.forEach(level => emptyDataPoint[level] = 0)
    return emptyDataPoint;
}

function getChartStartTime() { // Start chart at the beginning of the next hour
    return addHours(truncMinutes(new Date()), 1);
}

function aggregateData(reviews, unit, period, pendingReviews) {
    let data = [];

    for (let i = 0; i < period; i++) {
        const date = addTimeToDate(getChartStartTime(), unit, i);
        const reviewsInPeriod = reviews.filter(review => unit.isPeriodTheSame(unit.trunc(review['next_review']), date, unit));

        let dp = createEmptyDataPoint(date);

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

async function fetchData() {
    const reviewData = await BunProApiService.getAllReviews();
    const gp = await BunProApiService.getGrammarPoints();
    const grammarPointsMap = createGrammarPointsLookupMap(gp);

    const reviews = [...reviewData['reviews'], ...reviewData['ghost_reviews']]
        .filter(filterDeadGhostReviews)
        .map(review => ({
            ...review,
            grammarPoint: grammarPointsMap[review['grammar_point_id']]
        }));

    return reviews.sort((a, b) =>
        new Date(a['next_review']).getTime() - new Date(b['next_review']).getTime());
}

function BunProUpcomingReviewsChart() {
    const [pendingReviews, setPendingReviews] = useState(0);
    const [rawData, setRawData] = useState([]);
    const [targetItem, setTargetItem] = useState();
    const [period, setPeriod] = useState(UpcomingReviewUnits.hours.default);
    const [unit, setUnit] = useState(UpcomingReviewUnits.hours);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
            });
        BunProApiService.getPendingReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setPendingReviews(data.length);
            });
        return () => isSubscribed = false;
    }, []);

    const chartData = useMemo(
        () => aggregateData(rawData, unit, period, pendingReviews),
        [rawData, period, unit, pendingReviews]
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

    const getTopSeries = useMemo(() => (targetItem) => {
        return [...JLPTLevels].reverse().find(level => chartData[targetItem.point][level] > 0);
    }, [chartData]);

    const LabelWithDate = useMemo(() => createUpcomingReviewsChartLabel(unit), [unit.key]);

    const ReviewsToolTip = useMemo(() => (
        function ReviewsToolTip({targetItem}) {
            const dp = chartData[targetItem.point];
            const rowStyle = {display: 'flex', justifyContent: 'space-between', gap: '10px'};

            const isTotal = !targetItem.series.startsWith('N');
            return (
                <>
                    <div style={rowStyle}>
                        <div>{unit.key == UpcomingReviewUnits.hours.key ? 'Time' : 'Date'}:</div>
                        <div>{formatTimeUnitLabelText(unit, dp.date, true)}</div>
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
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>

                        <div>
                            <Checkbox value={unit.key === UpcomingReviewUnits.days.key}
                                      onChange={e => {
                                          if (e.target.checked) {
                                              setPeriod(UpcomingReviewUnits.days.default);
                                              setUnit(UpcomingReviewUnits.days);
                                          } else {
                                              setPeriod(UpcomingReviewUnits.hours.default);
                                              setUnit(UpcomingReviewUnits.hours);
                                          }
                                      }}
                            />
                            Show Days
                        </div>

                        <Typography variant={'h5'}>
                            Upcoming Reviews
                        </Typography>

                        <DaysSelector days={period}
                                      setDays={setPeriod}
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
                                />

                                <Stack
                                    stacks={[{series: JLPTLevels}]}
                                />

                                <FilterableLegend
                                    filterItems={[
                                        'total-points'
                                    ]}
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