import {useEffect, useMemo, useRef, useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {
    ArgumentAxis as ArgumentAxisBase,
    ArgumentScale,
    BarSeries,
    EventTracker,
    LineSeries,
    Stack
} from "@devexpress/dx-react-chart";
import {daysToMillis, millisToDays, truncDate} from "../../util/DateUtils";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import {AnkiReview} from "../models/AnkiReview";
import {useAnkiReviewsByDeck} from "../service/AnkiQueries";
import {DeckReviews} from "../service/AnkiDataUtil";


type DataPoint = any;

function dataPoint(date: number, previousDataPoint?: DataPoint): DataPoint {
    const dp: DataPoint = {
        date: truncDate(date),
        reviews: {},
        totalCount: previousDataPoint?.totalCount ?? 0
    };

    if (!!previousDataPoint) {
        const totalKeys = Object.keys(previousDataPoint).filter(key => key.includes('total_'));
        for (const key of totalKeys) {
            dp[key] = previousDataPoint[key] ?? 0;
        }
    }
    dp.addReview = (deck: string, review: AnkiReview) => {
        if (!dp.reviews[deck]) {
            dp.reviews[deck] = [review];
        } else {
            dp.reviews[deck].push(review);
        }

        dp[`count_${deck}`] = dp.reviews[deck].length;
        dp[`total_${deck}`] = (dp[`total_${deck}`] ?? 0) + 1;
        dp.totalCount = (previousDataPoint?.totalCount ?? 0) + Object.keys(dp)
            .filter(key => key.includes('count_'))
            .map(key => key.replace('count_', ''))
            .map(x => dp.reviews[x])
            .reduce((a, c) => a + c.length, 0);
    };
    return dp;
}


function formatMultiDeckReviewData(decks: DeckReviews[]): DataPoint[] {
    const reviews = [];
    for (const deck of decks) {
        reviews.push(...deck.reviews.map(r => ({
            ...r,
            deckName: deck.deckName
        })));
    }

    const orderedReviews = reviews.sort((a, b,) => a.reviewTime - b.reviewTime);
    const days = [dataPoint(orderedReviews[0].reviewTime)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.reviewTime).getTime()) {
            days.push(dataPoint(review.reviewTime, lastDay));
            lastDay = days[days.length - 1];
        }
        lastDay.addReview(review.deckName, review);
    }

    return days;
}

function useOptions(reviewsByDeck?: DataPoint[]) {
    const options = [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},
        {value: 365, text: '1 Yr'},
    ];

    if (!!reviewsByDeck) {
        options.push({
            value: millisToDays(Date.now() - reviewsByDeck[0].date),
            text: 'All'
        });
    }

    return options;
}

type AnkiReviewsChartProps = {
    deckNames: string[],
    showTotals: boolean,
};

function AnkiReviewsChart({deckNames, showTotals}: AnkiReviewsChartProps) {
    const {data, error, isLoading} = useAnkiReviewsByDeck(deckNames);
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const isFirstLoad = useRef(true);

    error && console.error(error);

    const reviewsByDeck = data ? formatMultiDeckReviewData(data) : undefined;
    const options = useOptions(reviewsByDeck);

    useEffect(() => {
        if (isFirstLoad.current && reviewsByDeck && reviewsByDeck.length > 0) {
            setDaysToLookBack(millisToDays(Date.now() - reviewsByDeck[0].date))
            isFirstLoad.current = false;
        }
    }, [data]);

    const chartData = useMemo(() =>
            !!reviewsByDeck ? reviewsByDeck.filter(dp => dp.date.getTime() >= Date.now() - daysToMillis(daysToLookBack)) : null,
        [reviewsByDeck, daysToLookBack]);

    function ReviewToolTip({text, targetItem}: Tooltip.ContentProps) {
        return (
            <>
                <p>{targetItem.series !== 'Total' ? 'Deck:' : null} {targetItem.series}</p>
                <p>Reviews: {(parseInt(text)).toLocaleString()}</p>
            </>
        );
    }

    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 6);

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

    // Create a key that is unique the selected decks.
    // If the selected decks change, without this key the React Chart will crash due to a bug.
    // This key will force the Chart element to be re-rendered a new component
    // https://github.com/DevExpress/devextreme-reactive/issues/3570
    const key = deckNames.reduce((a, c) => a + c, '');

    return (
        <Card>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}/>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            {showTotals ? 'Total' : null} Reviews
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
                    chartData ? (
                        // @ts-ignore
                        <Chart key={key} data={chartData}>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false}/>
                            <ValueAxis/>

                            {showTotals ? (
                                <LineSeries name="Total"
                                            valueField="totalCount"
                                            argumentField="date"
                                />
                            ) : null}

                            {deckNames.map((name, idx) => (
                                showTotals ? (
                                    <LineSeries key={idx}
                                                name={name}
                                                valueField={`total_${name}`}
                                                argumentField="date"
                                    />
                                ) : (
                                    <BarSeries key={idx}
                                               name={name}
                                               valueField={`count_${name}`}
                                               argumentField="date"/>
                                )
                            ))}

                            {!showTotals ? (
                                <Stack
                                    stacks={[{series: deckNames}]}
                                />
                            ) : null}

                            <Legend/>
                            <EventTracker/>
                            <Tooltip contentComponent={ReviewToolTip}/>
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default AnkiReviewsChart;
