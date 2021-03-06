import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector";
import {addDays, daysToMillis, truncDate} from "../../util/DateUtils";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import AnkiApiService from "../service/AnkiApiService";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis} from "@devexpress/dx-react-chart-material-ui";
import {AreaSeries, ArgumentScale, EventTracker, Stack, ValueAxis as ValueAxisBase} from "@devexpress/dx-react-chart";
import {AnkiColors} from "../../Constants";
import ToolTipLabel from "../../shared/ToolTipLabel";
import {AnkiReview} from "../models/AnkiReview";
import Area from "../../shared/Area";
import {AnkiCard} from "../models/AnkiCard";

function createCardTimestampMap(cards: AnkiCard[]) {
    const map: { [key: number]: AnkiCard[] } = {};
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

function createReviewTimestampMap(reviews: AnkiReview[]) {
    const map: { [key: number]: AnkiReview[] } = {};
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

type DataPoint = {
    date: number,
    newCount: number,
    learningCount: number,
    relearningCount: number,
    youngCount: number,
    matureCount: number,
};

async function getBreakDownHistoryData(decks: string[]) {
    // Fetch all the cards
    const cardIdPromises = decks.map(deck => AnkiApiService.getAllCardIdsByDeck(deck));
    const cardIdResults = await Promise.all(cardIdPromises);
    const cardIds = cardIdResults.flat();
    const cards = await AnkiApiService.getCardInfo(Array.from(new Set(cardIds)));

    // Fetch all the reviews
    const reviewPromises = decks.map(deck => AnkiApiService.getAllReviewsByDeck(deck));
    const reviewResults = await Promise.all(reviewPromises);
    const reviews = reviewResults.flat().sort((a, b) => a.reviewTime - b.reviewTime);

    const reviewsMap = createReviewTimestampMap(reviews);

    const firstDay = truncDate(reviews[0].reviewTime).getTime();
    const lastDay = Date.now();

    const tsMap = createCardTimestampMap(cards);

    const statusMap: { [cardId: number]: { newInterval: number, reviewType: number } } = {};

    // Add any cards that were created before the first review day
    Object.entries(tsMap)
        .filter(([key]) => parseInt(key) < firstDay)
        .forEach(([, value]) => {
            for (const card of (value as AnkiCard[])) {
                statusMap[card.cardId] = {
                    newInterval: 0,
                    reviewType: 0,
                };
            }
        })


    const data: DataPoint[] = [];

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

function useOptions() {
    return [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},
        {value: 365, text: '1 Yr'},
        {value: 10_000, text: 'All'},
    ];
}

type AnkiCardBreakDownHistoryChartProps = {
    deckNames: string[]
};

function AnkiCardBreakDownHistoryChart({deckNames}: AnkiCardBreakDownHistoryChartProps) {
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const [isLoading, setIsLoading] = useState(true);
    const [historyData, setHistoryData] = useState<DataPoint[] | null>(null);
    const options = useOptions();


    useEffect(() => {
        let isSubscribed = true;

        setIsLoading(true);
        getBreakDownHistoryData(deckNames)
            .then(data => {
                if (!isSubscribed)
                    return;
                setHistoryData(data)
            })
            .finally(() => setIsLoading(false));
        return () => {
            isSubscribed = false;
        };
    }, [deckNames]);


    const chartData = useMemo(() => (historyData ?? [])
            .filter(dp => new Date(dp.date).getTime() >= Date.now() - daysToMillis(daysToLookBack)),
        [historyData, daysToLookBack]);
    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 6);

    function StatsToolTip({targetItem}: Tooltip.ContentProps) {
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

    function LabelWithDate(props: ValueAxisBase.LabelProps) {
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
                                        options={options}
                        />
                    </Grid>
                </Grid>

                {isLoading ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    !!deckNames && chartData ? (
                        // @ts-ignore
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
