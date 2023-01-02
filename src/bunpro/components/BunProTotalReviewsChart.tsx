import {useEffect, useMemo, useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {ArgumentAxis as ArgumentAxisBase, ArgumentScale, EventTracker, LineSeries} from "@devexpress/dx-react-chart";
import {daysSinceDate, daysToMillis, millisToDays, truncDate} from "../../util/DateUtils";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import {BunProFlattenedReviewWithLevel, flattenBunProReviews} from "../service/BunProDataUtil";
import {BunProReview} from "../models/BunProReview";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import {useDeviceInfo} from "../../hooks/useDeviceInfo";

type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

class DataPoint {

    date: Date
    total: number = 0
    N5: number | undefined
    N4: number | undefined
    N3: number | undefined
    N2: number | undefined
    N1: number | undefined

    constructor(date: Date, previousDataPoint?: DataPoint) {
        if (!!previousDataPoint) {
            Object.assign(this, previousDataPoint)
        }
        this.date = truncDate(date);
    }

    addReview(review: BunProFlattenedReviewWithLevel) {
        this.total += 1;

        const level = review.level as JLPTLevel;
        const amount = this[level];
        if (amount) {
            this[level] = amount + 1;
        } else {
            this[level] = 1;
        }
    }

}

function aggregateReviewByDay(reviews: BunProFlattenedReviewWithLevel[]): DataPoint[] {
    const orderedReviews = reviews.sort((a, b,) => a.current.time.getTime() - b.current.time.getTime());

    const days = [new DataPoint(orderedReviews[0].current.time)];

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

function useData(reviews?: BunProReview[], grammarPoints?: BunProGrammarPoint[]) {
    const _reviews = flattenBunProReviews(grammarPoints, reviews);
    if (!_reviews)
        return undefined;
    return aggregateReviewByDay(_reviews)
}

function useOptions(rawData?: DataPoint[]) {
    const options = [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},
        {value: 365, text: '1 Yr'},
    ];

    if (!!rawData && rawData.length > 0) {
        options.push({
            value: millisToDays(Date.now() - rawData[0].date.getTime()),
            text: 'All'
        });
    }

    return options;
}

type BunProTotalReviewsChartProps = {
    reviews?: BunProReview[]
    grammarPoints?: BunProGrammarPoint[]
};

function BunProTotalReviewsChart({reviews, grammarPoints}: BunProTotalReviewsChartProps) {
    const rawData = useMemo(() => useData(reviews, grammarPoints), [reviews, grammarPoints]);
    const isLoading = !grammarPoints || !reviews;
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const {isMobile} = useDeviceInfo();
    const options = useOptions(rawData)

    useEffect(() => {
        if (!!rawData && rawData.length > 0) {
            setDaysToLookBack(daysSinceDate(rawData[0].date));
        }
    }, [rawData]);

    const chartData = useMemo(() => rawData?.filter(day => day.date.getTime() > Date.now() - (daysToMillis(daysToLookBack))), [rawData, daysToLookBack]);

    function ReviewToolTip({targetItem}: Tooltip.ContentProps) {
        if (!chartData)
            return <></>;
        const dp = chartData[targetItem.point];
        return (
            <>
                <p>{dp.date.toLocaleDateString()}</p>
                {targetItem.series == 'Total' ? (
                    <p>Total: {(dp.total).toLocaleString()}</p>
                ) : (
                    <p>{targetItem.series}: {dp[targetItem.series as JLPTLevel]}</p>
                )}
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
                            Total Reviews
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
