import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {ArgumentAxis as ArgumentAxisBase, ArgumentScale, EventTracker, LineSeries} from "@devexpress/dx-react-chart";
import {daysToMillis, millisToDays, truncDate} from "../../util/DateUtils";
// @ts-ignore
import {scaleBand} from 'd3-scale';
import {getVisibleLabelIndices} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import BunProApiService from "../service/BunProApiService";
import {createGrammarPointsLookupMap, RawBunProGrammarPointLookupMap} from "../service/BunProDataUtil";
import {RawBunProReview} from "../models/raw/RawBunProReview";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

type DataPoint = any;

function dataPoint(date: Date, previousDataPoint?: DataPoint): DataPoint {
    const createEmptyDataPoint = (): any => ({
        total: 0,
    });

    let dp: DataPoint = createEmptyDataPoint();

    if (!!previousDataPoint) {
        dp = {...previousDataPoint};
    }

    dp.date = truncDate(date);

    dp.addReview = (level: string) => {
        dp.total += 1;
        if (!!dp[level]) {
            dp[level] += 1;
        } else {
            dp[level] = 1;
        }
    };

    return dp;
}

function aggregateReviewByDay(reviews: RawBunProReview[], grammarPoints: RawBunProGrammarPointLookupMap) {
    const orderedReviews = reviews
        .map(review => ({
            ...review,
            createdAt: new Date(review['created_at'])
        }))
        .sort((a, b,) => a.createdAt.getTime() - b.createdAt.getTime());


    const days: DataPoint[] = [dataPoint(orderedReviews[0].createdAt)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.createdAt).getTime()) {
            days.push(dataPoint(review.createdAt, lastDay));
            lastDay = days[days.length - 1];
        }
        const gp = grammarPoints[review['grammar_point_id']]
        lastDay.addReview(gp.attributes.level.replace('JLPT', 'N'));
    }

    return days;
}

async function fetchGrammarPoints() {
    const gp = await BunProApiService.getGrammarPoints();
    return createGrammarPointsLookupMap(gp);
}

async function fetchData() {
    const reviews = await BunProApiService.getAllReviews();
    const grammarPoints = await fetchGrammarPoints();
    return aggregateReviewByDay(reviews.reviews, grammarPoints);
}

function daysSinceDate(date: Date | number) {
    const millis = truncDate(Date.now()).getTime() - truncDate(date).getTime();
    return millisToDays(millis);
}

function useOptions(rawData?: DataPoint[]) {
    const options = [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},
        {value: 365, text: '1 Yr'}
    ];

    if (!!rawData) {
        options.push({
            value: millisToDays(Date.now() - rawData[0].date),
            text: 'All'
        });
    }

    return options
}

function BunProTotalGrammarPointsChart() {
    const [rawData, setRawData] = useState<DataPoint[]>();
    const [isLoading, setIsLoading] = useState(false);
    const [daysToLookBack, setDaysToLookBack] = useState(60);
    const {width} = useWindowDimensions();
    const isMobile = width < 400;
    const options = useOptions(rawData);

    useEffect(() => {
        let isSubscribed = true;

        setIsLoading(true);
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;

                if (data.length > 0) {
                    setDaysToLookBack(daysSinceDate(data[0].date));
                }
                setRawData(data);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsLoading(false);
            });

        return () => {
            isSubscribed = false;
        };
    }, []);

    const chartData = useMemo(() => rawData?.filter(day => day.date.getTime() > Date.now() - (daysToMillis(daysToLookBack))), [rawData, daysToLookBack]);

    function ReviewToolTip({targetItem}: Tooltip.ContentProps) {
        if (!chartData) {
            return <></>;
        }
        const dp = chartData[targetItem.point];
        const value = targetItem.series.toLowerCase() === 'total' ? dp.total : dp[targetItem.series];
        return (
            <>
                <p>{dp.date.toLocaleDateString()}</p>
                <p>{targetItem.series}: {(value)?.toLocaleString()}</p>
            </>
        );
    }

    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], isMobile ? 3 : 6);

    function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
        const date = new Date(props.text);
        if (!date || !chartData) {
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
                            Total Grammar Points
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                        <PeriodSelector period={daysToLookBack}
                                        setPeriod={setDaysToLookBack}
                                        options={options}
                        />
                    </Grid>
                </Grid>

                {isLoading ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    !!chartData ? (
                        // @ts-ignore
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

export default BunProTotalGrammarPointsChart;
