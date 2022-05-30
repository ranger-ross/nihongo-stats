import {useEffect, useMemo, useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, MenuItem, Select, Typography} from "@mui/material";
import {ArgumentScale, BarSeries, EventTracker, Stack} from "@devexpress/dx-react-chart";
import {daysToMillis, getMonthName, millisToDays, truncDate, truncMonth, truncWeek} from "../../util/DateUtils.ts";
import {scaleBand} from 'd3-scale';
import {getVisibleLabelIndices} from "../../util/ChartUtils.ts";
import PeriodSelector from "../../shared/PeriodSelector.tsx";
import {fetchAllBunProReviews} from "../service/BunProDataUtil.js";
import useWindowDimensions from "../../hooks/useWindowDimensions.jsx";
import ToolTipLabel from "../../shared/ToolTipLabel.tsx";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

const units = {
    days: {
        key: 'days',
        text: 'Days',
        trunc: truncDate
    },
    weeks: {
        key: 'weeks',
        text: 'Weeks',
        trunc: truncWeek
    },
    months: {
        key: 'months',
        text: 'Months',
        trunc: truncMonth
    },
};

function UnitSelector({options, unit, onChange}) {
    return (
        <Select
            style={{minWidth: '130px'}}
            size={'small'}
            value={unit.key}
            onChange={e => onChange(options.find(o => o.key === e.target.value))}
        >
            {options.map((option) => (
                <MenuItem key={option.key}
                          value={option.key}
                >
                    {option.text}
                </MenuItem>
            ))}
        </Select>
    );
}


function DataPoint(date, unit) {
    let dp = {
        date: unit.trunc(date),
        total: 0,
        reviews: [],
        N5: 0,
        N4: 0,
        N3: 0,
        N2: 0,
        N1: 0,
    };

    dp.addReview = (review) => {
        dp.reviews.push(review);
        dp.total = dp.reviews.length;

        const level = review.level;
        dp[level] += 1;
    };
    return dp;
}

function aggregateReviewByUnit(reviews, unit) {
    const orderedReviews = reviews.sort((a, b,) => a.current.time.getTime() - b.current.time.getTime());

    let days = [new DataPoint(orderedReviews[0].current.time, unit)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== unit.trunc(review.current.time).getTime()) {
            days.push(new DataPoint(review.current.time, unit));
            lastDay = days[days.length - 1];
        }
        lastDay.addReview(review);
    }
    return days;
}

function BunProReviewsHistoryChart() {
    const [rawData, setRawData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [unit, setUnit] = useState(units.days);
    const [daysToLookBack, setDaysToLookBack] = useState(60);
    const {width} = useWindowDimensions();
    const isMobile = width < 400;


    useEffect(() => {
        let isSubscribed = true;

        setIsLoading(true);
        fetchAllBunProReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsLoading(false);
            });

        return () => isSubscribed = false;
    }, []);

    const aggregatedDate = useMemo(() => rawData ? aggregateReviewByUnit(rawData, unit) : [], [rawData, unit.key])
    const chartData = useMemo(() => aggregatedDate?.filter(day => day.date.getTime() > Date.now() - (daysToMillis(daysToLookBack))), [aggregatedDate, daysToLookBack]);

    const ReviewToolTip = useMemo(() => {
        function getDateLabelText(date) {
            if (unit.key === units.days.key)
                return date.toLocaleDateString()
            else if (unit.key === units.weeks.key)
                return date.toLocaleDateString()
            else if (unit.key === units.months.key)
                return `${getMonthName(date, true)} ${date.getFullYear()}`
        }

        return function ReviewToolTip({targetItem}) {
            const dp = chartData[targetItem.point];
            return (
                <>
                    <ToolTipLabel title="Date" value={getDateLabelText(dp.date)}/>
                    <br/>
                    <ToolTipLabel title="Total" value={(dp.total).toLocaleString()}/>
                    {JLPTLevels.map(level => (
                        dp[level] ? <ToolTipLabel key={level} title={level} value={dp[level]}/> : null
                    ))}
                </>
            );
        }
    }, [chartData, unit.key])

    const LabelWithDate = useMemo(() => {
        const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], isMobile ? 3 : 6);
        return function LabelWithDate(props) {
            const date = new Date(props.text);
            if (!date) {
                return (<></>)
            }

            const index = chartData.findIndex(dp => dp.date.getTime() === date.getTime());
            const isVisible = visibleLabelIndices.includes(index);

            return (
                <>
                    {isVisible ? (
                        <ArgumentAxis.Label
                            {...props}
                            text={new Date(date).toLocaleDateString()}
                        />
                    ) : null}
                </>
            );
        }
    }, [chartData]);

    return (
        <Card style={{margin: '15px'}}>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}>
                        <UnitSelector
                            options={[
                                units.days,
                                units.weeks,
                                units.months
                            ]}
                            unit={unit}
                            onChange={setUnit}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            Reviews
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                        <PeriodSelector period={daysToLookBack}
                                        setPeriod={setDaysToLookBack}
                                        options={[
                                            {value: 30, text: '1 Mon'},
                                            {value: 60, text: '2 Mon'},
                                            {value: 90, text: '3 Mon'},
                                            {value: 180, text: '6 Mon'},
                                            {value: 365, text: '1 Yr'},
                                            !!rawData && rawData.length > 0 ? {
                                                value: millisToDays(Date.now() - new Date(rawData[0]['created_at'])),
                                                text: 'All'
                                            } : null
                                        ]}
                        />
                    </Grid>
                </Grid>

                {isLoading ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    !!chartData ? (
                        <Chart data={chartData}>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false}/>
                            <ValueAxis/>

                            {JLPTLevels.map(level => (
                                <BarSeries
                                    key={level}
                                    name={level}
                                    valueField={level}
                                    argumentField="date"/>
                            ))}

                            <Stack
                                stacks={[{series: JLPTLevels}]}
                            />

                            <Legend position={isMobile ? 'bottom' : 'right'}/>
                            <EventTracker/>
                            <Tooltip contentComponent={ReviewToolTip}/>
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default BunProReviewsHistoryChart;
