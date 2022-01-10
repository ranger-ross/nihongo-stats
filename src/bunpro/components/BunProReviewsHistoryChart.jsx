import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {ArgumentScale, BarSeries, EventTracker, Stack} from "@devexpress/dx-react-chart";
import {daysToMillis, millisToDays, truncDate} from "../../util/DateUtils.js";
import {scaleBand} from 'd3-scale';
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import DaysSelector from "../../shared/DaysSelector.jsx";
import {fetchAllBunProReviews} from "../service/BunProDataUtil.js";
import useWindowDimensions from "../../hooks/useWindowDimensions.jsx";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

function DataPoint(date) {
    let dp = {
        date: truncDate(date),
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

function aggregateReviewByDay(reviews) {
    const orderedReviews = reviews.sort((a, b,) => a.current.time.getTime() - b.current.time.getTime());

    let days = [new DataPoint(orderedReviews[0].current.time)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.current.time).getTime()) {
            days.push(new DataPoint(review.current.time));
            lastDay = days[days.length - 1];
        }
        lastDay.addReview(review);
    }
    return days;
}

async function fetchData() {
    const reviews = await fetchAllBunProReviews();
    return aggregateReviewByDay(reviews)
}

function BunProReviewsHistoryChart() {
    const [rawData, setRawData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [daysToLookBack, setDaysToLookBack] = useState(60);
    const {width} = useWindowDimensions();
    const isMobile = width < 400;


    useEffect(() => {
        let isSubscribed = true;

        setIsLoading(true);
        fetchData()
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

    const chartData = useMemo(() => rawData?.filter(day => day.date.getTime() > Date.now() - (daysToMillis(daysToLookBack))), [rawData, daysToLookBack]);

    function ReviewToolTip({targetItem}) {
        const dp = chartData[targetItem.point];
        return (
            <>
                <p>{dp.date.toLocaleDateString()}</p>
                <p>Total: {(dp.total).toLocaleString()}</p>
                {JLPTLevels.map(level => (
                    dp[level] ? <p key={level}>{level}: {dp[level]}</p> : null
                ))}
            </>
        );
    }

    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], isMobile ? 3 : 6);

    const LabelWithDate = (props) => {
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
    };

    return (
        <Card>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}/>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            Reviews
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                        <DaysSelector days={daysToLookBack}
                                      setDays={setDaysToLookBack}
                                      options={[
                                          {value: 30, text: '1 Mon'},
                                          {value: 60, text: '2 Mon'},
                                          {value: 90, text: '3 Mon'},
                                          {value: 180, text: '6 Mon'},
                                          {value: 365, text: '1 Yr'},
                                          !!rawData ? {
                                              value: millisToDays(Date.now() - rawData[0].date),
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
