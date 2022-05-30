import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector.tsx";
import {daysToMillis, millisToDays, truncDate} from "../../util/DateUtils.ts";
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis} from "@devexpress/dx-react-chart-material-ui";
import {ArgumentScale, EventTracker, LineSeries} from "@devexpress/dx-react-chart";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import AnkiApiService from "../service/AnkiApiService.js";
import {scaleBand} from 'd3-scale';
import {getVisibleLabelIndices} from "../../util/ChartUtils.ts";

function DataPoint(date, previousDataPoint) {
    let dp = {
        date: truncDate(date),
        cards: {},
        totalCount: previousDataPoint?.totalCount ?? 0
    };

    if (!!previousDataPoint) {
        const totalKeys = Object.keys(previousDataPoint).filter(key => key.includes('total_'));
        for (const key of totalKeys) {
            dp[key] = previousDataPoint[key] ?? 0;
        }
    }
    dp.addCard = (deck, review) => {
        if (!dp.cards[deck]) {
            dp.cards[deck] = [review];
        } else {
            dp.cards[deck].push(review);
        }

        if (!!previousDataPoint && !previousDataPoint[`total_${deck}`]) {
            previousDataPoint[`count_${deck}`] = 0;
            previousDataPoint[`total_${deck}`] = 0;
        }

        dp[`count_${deck}`] = dp.cards[deck].length;
        dp[`total_${deck}`] = (dp[`total_${deck}`] ?? 0) + 1;
        dp.totalCount = (previousDataPoint?.totalCount ?? 0) + Object.keys(dp)
            .filter(key => key.includes('count_'))
            .map(key => key.replace('count_', ''))
            .map(x => dp.cards[x])
            .reduce((a, c) => a + c.length, 0);
    };
    return dp;
}

function formatMultiDeckReviewData(decks) {
    let reviews = [];
    for (const deck of decks) {
        reviews.push(...deck.reviews.map(r => ({
            ...r,
            deckName: deck.deckName
        })));
    }

    const orderedReviews = reviews.sort((a, b,) => a.reviewTime - b.reviewTime);
    const dayBeforeStartPoint = new DataPoint(orderedReviews[0].reviewTime - daysToMillis(1))
    let days = [dayBeforeStartPoint, new DataPoint(orderedReviews[0].reviewTime, dayBeforeStartPoint)];

    let cards = {};
    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.reviewTime).getTime()) {
            days.push(new DataPoint(review.reviewTime, lastDay));
            lastDay = days[days.length - 1];
        }

        if (!!cards[review.cardId]) {
            continue;
        }
        cards[review.cardId] = true;
        lastDay.addCard(review.deckName, review);
    }

    return days;
}

function AnkiTotalCardsHistoryChart({deckNames}) {
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const [isLoading, setIsLoading] = useState(true);
    const [decksToDisplay, setDecksToDisplay] = useState([]);
    const [cardData, setCardData] = useState(null);


    useEffect(() => {
        let isSubscribed = true;

        let reviewPromises = [];
        deckNames.forEach(name => reviewPromises.push(AnkiApiService.getAllReviewsByDeck(name)));
        setIsLoading(true);
        Promise.all(reviewPromises)
            .then(data => {
                if (!isSubscribed)
                    return;
                let deckData = data.map(((value, index) => ({
                    deckName: deckNames[index],
                    reviews: value
                })));
                const formattedData = formatMultiDeckReviewData(deckData);
                setCardData(formattedData);
                setDaysToLookBack(millisToDays(Date.now() - formattedData[0].date))
                setDecksToDisplay(deckNames);
            })
            .finally(() => setIsLoading(false));
        return () => isSubscribed = false;
    }, [deckNames]);

    const chartData = useMemo(() => (cardData ?? [])
            .filter(dp => dp.date.getTime() >= Date.now() - daysToMillis(daysToLookBack)),
        [cardData, daysToLookBack]);
    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 6);

    function CardToolTip({text, targetItem}) {
        return (
            <>
                <p>{targetItem.series !== 'Total' ? 'Deck:' : null} {targetItem.series}</p>
                <p>Cards: {(parseInt(text)).toLocaleString()}</p>
            </>
        );
    }

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
        <Card>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}/>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            Total Cards
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
                                            !!cardData ? {
                                                value: millisToDays(Date.now() - cardData[0].date),
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
                    !!decksToDisplay && chartData ? (
                        <Chart data={chartData}>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false}/>
                            <ValueAxis/>

                            <LineSeries name="Total"
                                        valueField="totalCount"
                                        argumentField="date"
                            />

                            {decksToDisplay?.map((name, idx) => (
                                <LineSeries key={idx}
                                            name={name}
                                            valueField={`total_${name}`}
                                            argumentField="date"
                                />
                            ))}

                            <Legend/>
                            <EventTracker/>
                            <Tooltip contentComponent={CardToolTip}/>
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default AnkiTotalCardsHistoryChart;
