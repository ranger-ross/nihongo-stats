import * as React from 'react';
import {
    Chart, Legend, Tooltip, ValueAxis, ArgumentAxis,
} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {ArgumentScale, BarSeries, EventTracker, LineSeries, Stack} from "@devexpress/dx-react-chart";
import {truncDate} from "../../util/DateUtils.js";
import AnkiApiService from "../service/AnkiApiService.js";
import {scaleBand} from 'd3-scale';
import useWindowDimensions from "../../hooks/useWindowDimensions.jsx";

function DataPoint(date, previousDataPoint) {
    let dp = {
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
    dp.addReview = (deck, review) => {
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

function formatMultiDeckReviewData(decks) {
    let reviews = [];
    for (const deck of decks) {
        reviews.push(...deck.reviews.map(r => ({
            ...r,
            deckName: deck.deckName
        })));
    }

    const orderedReviews = reviews.sort((a, b,) => a.reviewTime - b.reviewTime);
    let days = [new DataPoint(orderedReviews[0].reviewTime)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.reviewTime).getTime()) {
            days.push(new DataPoint(review.reviewTime, lastDay));
            lastDay = days[days.length - 1];
        }
        lastDay.addReview(review.deckName, review);
    }

    return days;
}

function AnkiReviewsChart({deckNames, showTotals}) {
    const [reviewsByDeck, setReviewsByDeck] = useState(null);
    const [decksToDisplay, setDecksToDisplay] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
                setReviewsByDeck(formatMultiDeckReviewData(deckData));
                setDecksToDisplay(deckNames);
            })
            .finally(() => setIsLoading(false));
        return () => isSubscribed = false;
    }, [deckNames]);

    function ReviewToolTip({text, targetItem}) {
        return (
            <>
                <p>{targetItem.series !== 'Total' ? 'Deck:' : null} {targetItem.series}</p>
                <p>Reviews: {text}</p>
            </>
        );
    }

    const LabelWithDate = (props) => {
        const {width} = useWindowDimensions();
        const date = new Date(props.text);
        if (!date) {
            return (<></>)
        }

        const isSmallScreen = width < 550;
        const totalLabels = isSmallScreen ? 3 : 6;
        const labelTickSize = Math.floor(365 / totalLabels); // TODO: Replace 365 with range
        const days = Math.floor((Date.now() - date.getTime()) / 86400000);
        return (
            <>
                {days % labelTickSize == 0 ? (
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

                <Grid item xs={12}>
                    <Typography variant={'h5'} style={{textAlign: 'center'}}>
                        {showTotals ? 'Total' : null} Reviews
                    </Typography>
                </Grid>

                {isLoading ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    !!decksToDisplay && reviewsByDeck ? (
                        <Chart data={reviewsByDeck}>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false}/>
                            <ValueAxis/>

                            {showTotals ? (
                                <LineSeries name="Total"
                                            valueField="totalCount"
                                            argumentField="date"
                                />
                            ) : null}

                            {decksToDisplay?.map((name, idx) => (
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
                                    stacks={[{series: decksToDisplay}]}
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