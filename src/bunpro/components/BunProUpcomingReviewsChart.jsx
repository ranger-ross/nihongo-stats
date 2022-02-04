import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, Checkbox, CircularProgress, Typography} from "@mui/material";
import {
    addDays,
    addHours,
    areDatesSameDay,
    areDatesSameDayAndHour,
    truncDate,
    truncMinutes
} from '../../util/DateUtils.js';
import DaysSelector from "../../shared/DaysSelector.jsx";
import {scaleBand} from 'd3-scale';
import BunProApiService from "../service/BunProApiService.js";
import {createGrammarPointsLookupMap} from "../service/BunProDataUtil.js";
import {ArgumentAxis, Chart, Legend, ScatterSeries, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {ArgumentScale, BarSeries, EventTracker, LineSeries, Stack, ValueScale} from "@devexpress/dx-react-chart";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

const units = {
    hours: {
        key: 'hours',
        text: 'Hours',
        trunc: truncMinutes
    },
    days: {
        key: 'days',
        text: 'Days',
        trunc: truncDate
    }
};

const daysOptions = [
    {value: 7, text: '7'},
    {value: 14, text: '14'},
    {value: 30, text: '30'},
];

const hoursOptions = [
    {value: 24, text: '24'},
    {value: 48, text: '48'},
    {value: 72, text: '72'},
];

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

function addTimeToDate(date, unit, amount) {
    if (unit.key === units.days.key) {
        return addDays(date, amount);
    } else {
        return addHours(date, amount);
    }
}

function isPeriodTheSame(date1, date2, unit) {
    if (unit.key === units.days.key) {
        return areDatesSameDay(date1, date2);
    } else {
        return areDatesSameDayAndHour(date1, date2);
    }
}

function getHoursLabelText(date, isToolTipLabel) {
    if (!isToolTipLabel && ![0, 6, 12, 18].includes(date.getHours())) {
        return '';
    }

    return date.toLocaleTimeString("en-US", {hour: 'numeric'});
}

function getLabelText(unit, date, isToolTipLabel) {
    let _date = new Date(date)
    if (unit.key === units.days.key) {
        return `${_date.getMonth() + 1}/${_date.getDate()}`;
    } else {
        return getHoursLabelText(_date, isToolTipLabel);
    }
}

function getChartStartTime() { // Start chart at the beginning of the next hour
    return addHours(truncMinutes(new Date()), 1);
}

function aggregateData(reviews, unit, period) {
    let data = [];

    // TODO: handle initial reviews

    for (let i = 0; i < period; i++) {
        const date = addTimeToDate(getChartStartTime(), unit, i);
        const reviewsInPeriod = reviews.filter(review => isPeriodTheSame(unit.trunc(review['next_review']), date, unit));

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
    const [rawData, setRawData] = useState([]);
    const [targetItem, setTargetItem] = useState();
    const [period, setPeriod] = useState(48);
    const [unit, setUnit] = useState(units.hours);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
            });
        return () => isSubscribed = false;
    }, []);

    const chartData = useMemo(
        () => aggregateData(rawData, unit, period),
        [rawData, period, unit]
    );

    const maxScale = useMemo(() => {
        const totals = chartData.map(dp => JLPTLevels.map(level => dp[level]).reduce((a, c) => a + c))
        return Math.max(5, ...totals) + 5;
    }, [chartData]);

    function isLabelVisible(seriesIndex, index) {
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
    }

    const BarWithLabel = useMemo(() => (
        function BarWithLabel(props) {
            const {arg, val, value, seriesIndex, index} = props;

            if (value === 0)
                return (<></>);

            return (
                <>
                    <BarSeries.Point {...props}/>

                    {isLabelVisible(seriesIndex, index) ? (
                        <Chart.Label
                            x={arg}
                            y={val - 10}
                            textAnchor={'middle'}
                            style={{fill: 'white', fontWeight: 'bold'}}
                        >
                            {value}
                        </Chart.Label>
                    ) : null}
                </>
            );
        }
    ), [chartData])

    const getTopSeries = useMemo(() => (targetItem) => {
        return [...JLPTLevels].reverse().find(level => chartData[targetItem.point][level] > 0);
    }, [chartData]);

    const LabelWithDate = useMemo(() => (
        function LabelWithDate(props) {
            const {text} = props;
            let label = '';
            if (text) {
                const rawTimestamp = parseInt(text);
                label = !!rawTimestamp ? getLabelText(unit, rawTimestamp, false) : '';
            }
            return (
                <ArgumentAxis.Label
                    {...props}
                    text={label}
                />
            );
        }
    ), [unit.key]);

    const ReviewsToolTip = useMemo(() => (
        function ReviewsToolTip({targetItem}) { // TODO: Handle totals
            const dp = chartData[targetItem.point];
            const rowStyle = {display: 'flex', justifyContent: 'space-between', gap: '10px'};

            const isTotal = !targetItem.series.startsWith('N');
            return (
                <>
                    <div style={rowStyle}>
                        <div>{unit.key == units.hours.key ? 'Time' : 'Date'}:</div>
                        <div>{getLabelText(unit, dp.date, true)}</div>
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
                            <Checkbox value={unit === units.days}
                                      onChange={e => {
                                          if (e.target.checked) {
                                              setPeriod(14);
                                              setUnit(units.days);
                                          } else {
                                              setPeriod(48);
                                              setUnit(units.hours);
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
                                      options={unit === units.days ? daysOptions : hoursOptions}
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
                                    name="total"
                                    valueField="total"
                                    argumentField="date"
                                    color={'#e0b13e'}
                                    scaleName="total"
                                />

                                <ScatterSeries
                                    name="total-points"
                                    valueField="total"
                                    argumentField="date"
                                    color={'#e0b13e'}
                                    scaleName="total"
                                />

                                <Stack
                                    stacks={[{series: JLPTLevels}]}
                                />

                                {/*TODO: fix legend showing totals*/}
                                <Legend/>
                                <EventTracker/>
                                <Tooltip targetItem={!!targetItem && !targetItem.series.includes('total')
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