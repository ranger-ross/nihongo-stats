import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector.jsx";
import {addDays, daysToMillis, truncDate} from "../../util/DateUtils.js";
import * as React from "react";
import {useEffect, useState, useMemo} from "react";
import AnkiApiService from "../service/AnkiApiService.js";
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import {scaleBand} from 'd3-scale';
import {area, curveCatmullRom,} from 'd3-shape';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis} from "@devexpress/dx-react-chart-material-ui";
import {AreaSeries, ArgumentScale, EventTracker, Stack} from "@devexpress/dx-react-chart";

import {AnkiColors} from "../../Constants.js";
import ToolTipLabel from "../../shared/ToolTipLabel.jsx";

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

function createCardTimestampMap(cards) {
    let map = {};
    for (const card of cards) {
        const date = truncDate(card.note).getTime();
        if (!!map[date]) {
            map[date].push(card);
        } else {
            map[date] = [card];
        }
    }
    return map;
}

function createReviewTimestampMap(reviews) {
    let map = {};
    for (const review of reviews) {
        const date = truncDate(review.reviewTime).getTime();
        if (!!map[date]) {
            map[date].push(review);
        } else {
            map[date] = [review];
        }
    }
    return map;
}

// TODO: refactor variables names
async function getCounts(deck) {
    const cardIds = await AnkiApiService.getAllCardIdsByDeck(deck);
    const cards = await AnkiApiService.getCardInfo(Array.from(new Set(cardIds)));

    let reviews = await AnkiApiService.getAllReviewsByDeck(deck);
    reviews = reviews.sort((a, b) => a.reviewTime - b.reviewTime);

    const reviewsMap = createReviewTimestampMap(reviews);

    let firstDay = truncDate(reviews[0].reviewTime).getTime();
    let lastDay = Date.now();

    let tsMap = createCardTimestampMap(cards);

    let statusMap = {};

    // Add any cards that were created before the first review day
    Object.entries(tsMap)
        .filter(([key]) => parseInt(key) < firstDay)
        .forEach(([, value]) => {
            for (const card of value) {
                statusMap[card.cardId] = {
                    newInterval: 0,
                    reviewType: 0,
                };
            }
        })


    let data = [];

    function snapshot() {
        let newCount = 0;
        let youngCount = 0;
        let matureCount = 0
        let learningCount = 0;
        let relearningCount = 0;


        for (const value of Object.values(statusMap)) {
            if (value.newInterval >= 21) {
                matureCount += 1;
                continue;
            }
            if (value.newInterval > 0) {
                youngCount += 1;
                continue;
            }
            if (value.newInterval == 0) {
                newCount += 1;
                continue;
            }
            if (value.reviewType == 2) {
                relearningCount += 1;
            } else {
                learningCount += 1;
            }
        }
        return {
            newCount,
            learningCount,
            relearningCount,
            youngCount,
            matureCount
        };
    }

    let currentDay = firstDay;
    while (currentDay <= lastDay) {

        // Add any newly created cards to the status map
        const cardsCreatedOnCurrentDay = tsMap[currentDay];
        if (cardsCreatedOnCurrentDay) {
            for (const card of cardsCreatedOnCurrentDay) {
                statusMap[card.cardId] = {
                    newInterval: 0,
                    reviewType: 0,
                };
            }
        }

        // Update the card interval for any cards reviewed on current day
        const reviewsOnCurrentDay = reviewsMap[currentDay];
        if (reviewsOnCurrentDay) {
            for (const review of reviewsOnCurrentDay) {
                statusMap[review.cardId] = {
                    newInterval: review.newInterval,
                    reviewType: review.reviewType,
                };
            }
        }

        // Take a snapshot of the card counts on current day
        data.push({
            date: currentDay,
            ...snapshot()
        })

        // Advance to the next day
        currentDay = addDays(currentDay, 1).getTime();
    }

    return data;
}

function Area(props) {
    const {
        coordinates,
        color,
    } = props;

    return (
        <path
            fill={color}
            d={area()
                .x(({arg}) => arg)
                .y1(({val}) => val)
                .y0(({startVal}) => startVal)
                .curve(curveCatmullRom)(coordinates)}
            opacity={0.5}
        />
    );
}

function AnkiCardBreakDownHistoryChart({deckNames}) {
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const [isLoading, setIsLoading] = useState(true);
    const [decksToDisplay, setDecksToDisplay] = useState([]);
    const [historyData, setHistoryData] = useState(null);


    useEffect(async () => {
        let isSubscribed = true;

        setIsLoading(true);
        getCounts(deckNames[0]) // TODO: add multi deck support
            .then(data => {
                if (!isSubscribed)
                    return;

                setHistoryData(data)
            })
            .finally(() => setIsLoading(false));
        return () => isSubscribed = false;
    }, [deckNames]);



    const chartData = useMemo(() => (historyData ?? [])
            .filter(dp => new Date(dp.date).getTime() >= Date.now() - daysToMillis(daysToLookBack)),
        [historyData, daysToLookBack]);
    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 6);

    function StatsToolTip({targetItem}) {
        const dp = chartData[targetItem.point];
        return (
            <>
                <ToolTipLabel title="Date" value={new Date(dp.date).toLocaleDateString()}/>
                <ToolTipLabel title="New" value={dp.newCount}/>
                <ToolTipLabel title="Learning" value={dp.learningCount}/>
                <ToolTipLabel title="Relearning" value={dp.relearningCount}/>
                <ToolTipLabel title="Young" value={dp.youngCount}/>
                <ToolTipLabel title="Mature" value={dp.matureCount}/>
            </>
        );
    }

    function LabelWithDate(props) {
        const date = new Date(props.text);
        if (!date) {
            return (<></>)
        }

        const index = chartData.findIndex(dp => dp.date === date.getTime());
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
                            Card Breakdown History
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
                                            !!historyData ? {
                                                value: 10_000,
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

                            <AreaSeries
                                name="Mature"
                                valueField="matureCount"
                                argumentField="date"
                                color={AnkiColors.darkGreen}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Learning"
                                valueField="learningCount"
                                argumentField="date"
                                color={AnkiColors.lightOrange}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Relearning"
                                valueField="relearningCount"
                                argumentField="date"
                                color={AnkiColors.redOrange}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Young"
                                valueField="youngCount"
                                argumentField="date"
                                color={AnkiColors.lightGreen}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="New"
                                valueField="newCount"
                                argumentField="date"
                                color={AnkiColors.blue}
                                seriesComponent={Area}
                            />

                            <Stack
                                stacks={[{
                                    series: ['New', 'Learning', 'Relearning', 'Young', 'Mature'],
                                }]}
                            />

                            <Legend/>
                            <EventTracker/>
                            <Tooltip contentComponent={StatsToolTip}/>
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default AnkiCardBreakDownHistoryChart;
