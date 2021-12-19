import {Card, CardContent, Typography, Grid} from "@mui/material";
import {useEffect, useState} from "react";
import {truncDate} from "../../util/DateUtils";
import AnkiApiService from "../service/AnkiApiService";
import {Chart, ValueAxis, ArgumentAxis, Tooltip} from '@devexpress/dx-react-chart-material-ui';
import {BarSeries, LineSeries, Stack} from "@devexpress/dx-react-chart";
import {EventTracker} from "@devexpress/dx-react-chart";


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

    useEffect(() => {
        let reviewPromises = [];
        const _deckNames = deckNames.filter(name => name.toLowerCase() !== 'default');
        _deckNames.forEach(name => reviewPromises.push(AnkiApiService.getAllReviewsByDeck(name)));

        Promise.all(reviewPromises)
            .then(data => {
                let deckData = data.map(((value, index) => ({
                    deckName: _deckNames[index],
                    reviews: value
                })));
                setReviewsByDeck(formatMultiDeckReviewData(deckData));
            })
    }, []);

    function ReviewToolTip({text, targetItem}) {
        return (
            <>
                <p>{targetItem.series !== 'Total' ? 'Deck:' : null} {targetItem.series}</p>
                <p>Reviews: {text}</p>
            </>
        );
    }

    return (
        <Card>
            <CardContent>

                <Grid item xs={12}>
                    <Typography variant={'h5'} style={{textAlign: 'center'}}>
                        {showTotals ? 'Total' : null} Reviews
                    </Typography>
                </Grid>

                {!!deckNames && reviewsByDeck ? (
                    <Chart data={reviewsByDeck}>
                        <ValueAxis/>
                        <ArgumentAxis
                            tickFormat={() => text => new Date(text).toLocaleDateString()}
                        />

                        {showTotals ? (
                            <LineSeries name="Total"
                                        valueField="totalCount"
                                        argumentField="date"
                            />
                        ) : null}

                        {deckNames?.map((name, idx) => (
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

                        <EventTracker/>
                        <Tooltip contentComponent={ReviewToolTip}/>
                    </Chart>
                ) : null}

            </CardContent>
        </Card>
    );
}

export default AnkiReviewsChart;