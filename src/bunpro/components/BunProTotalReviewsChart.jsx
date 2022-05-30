import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {ArgumentScale, EventTracker, LineSeries} from "@devexpress/dx-react-chart";
import {daysToMillis, millisToDays, truncDate} from "../../util/DateUtils.ts";
import {scaleBand} from 'd3-scale';
import {getVisibleLabelIndices} from "../../util/ChartUtils.ts";
import PeriodSelector from "../../shared/PeriodSelector.tsx";
import {fetchAllBunProReviews} from "../service/BunProDataUtil.js";
import useWindowDimensions from "../../hooks/useWindowDimensions.tsx";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];


function DataPoint(date, previousDataPoint) {
    const createEmptyDataPoint = () => ({
        total: 0,
    });

    let dp = createEmptyDataPoint();

    if (!!previousDataPoint) {
        dp = {...previousDataPoint};
    }

    dp.date = truncDate(date);

    dp.addReview = (review) => {
        dp.total += 1;

        const level = review.level;
        if (!dp[level]) {
            dp[level] = 1;
        } else {
            dp[level] += 1;
        }
    };
    return dp;
}


function aggregateReviewByDay(reviews) {
    const orderedReviews = reviews.sort((a, b,) => a.current.time.getTime() - b.current.time.getTime());

    let days = [new DataPoint(orderedReviews[0].current.time)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.current.time).getTime()) {
            days.push(new DataPoint(review.current.time, lastDay));
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

function BunProTotalReviewsChart() {
    const [rawData, setRawData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const {width} = useWindowDimensions();
    const isMobile = width < 400;

    useEffect(() => {
        let isSubscribed = true;

        setIsLoading(true);
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setDaysToLookBack(data.length)
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
                {targetItem.series == 'Total' ? (
                    <p>Total: {(dp.total).toLocaleString()}</p>
                ) : (
                    <p>{targetItem.series}: {dp[targetItem.series]}</p>
                )}
            </>
        );
    }

    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], isMobile ? 3 : 6);

    function LabelWithDate(props) {
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

    return (
        <Card style={{margin: '15px'}}>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}/>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            Total Reviews
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
                                <LineSeries
                                    key={level}
                                    name={level}
                                    valueField={level}
                                    argumentField="date"/>
                            ))}

                            <LineSeries
                                name="Total"
                                valueField="total"
                                argumentField="date"/>

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

export default BunProTotalReviewsChart;
