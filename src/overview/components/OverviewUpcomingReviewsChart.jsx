import React, {useEffect, useMemo, useState} from "react";
import {Box, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addDays, daysToMillis, truncDate} from '../../util/DateUtils.js';
import DaysSelector from "../../shared/DaysSelector.jsx";
import {scaleBand} from 'd3-scale';
import BunProApiService from "../../bunpro/service/BunProApiService.js";
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Animation, ArgumentScale, BarSeries, EventTracker, Stack} from "@devexpress/dx-react-chart";
import AnkiApiService from "../../anki/service/AnkiApiService.js";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.jsx";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey.jsx";
import {useBunProApiKey} from "../../hooks/useBunProApiKey.jsx";
import {createAnkiCardsDueQuery} from "../../anki/service/AnkiDataUtil.js";
import {
    AnkiColors, AppNames,
    BunProColors,
    WanikaniColors
} from "../../Constants.js";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService.js";
import {useAnkiConnection} from "../../hooks/useAnkiConnection.jsx";

function filterDeadGhostReviews(review) {
    const fiveYearsFromNow = Date.now() + (1000 * 60 * 60 * 24 * 365 * 5)
    return new Date(review['next_review']).getTime() < fiveYearsFromNow;
}

function DataPoint(date) {
    let dp = {
        date: truncDate(date),
        bunProCount: 0,
        wanikaniCount: 0,
        ankiCount: 0,
    };

    dp.addReview = (appName) => {
        if (appName === AppNames.anki)
            dp.ankiCount += 1;
        else if (appName === AppNames.bunpro)
            dp.bunProCount += 1;
        else if (appName === AppNames.wanikani)
            dp.wanikaniCount += 1;
    };

    return dp;
}

async function getBunProReviews() {
    const reviewData = await BunProApiService.getAllReviews();
    return [...reviewData['reviews'], ...reviewData['ghost_reviews']]
        .filter(filterDeadGhostReviews)
        .map(review => ({...review, date: new Date(review['next_review'])}));
}

async function getAnkiReviews(decks, numberOfDays) {
    let actions = [];
    for (let i = 0; i < numberOfDays; i++) {
        for (const deck of decks) {
            actions.push(createAnkiCardsDueQuery(deck, i));
        }
    }

    const listOfListDueCards = await AnkiApiService.sendMultiRequest(actions);

    let data = [];

    for (let i = 0; i < listOfListDueCards.length; i++) {
        const day = Math.floor(i / decks.length);
        const date = truncDate(Date.now() + daysToMillis(day));

        data.push(...listOfListDueCards[i]
            .map(review => ({date, review})));
    }

    return data;
}

function addAppNameToReviewData(data, appName) {
    return data.map(review => ({...review, appName}));
}

function aggregateData(ankiReviews, bunProReviews, wanikaniReviews, days) {
    const reviews = [
        ...(bunProReviews ? addAppNameToReviewData(bunProReviews, AppNames.bunpro) : []),
        ...(ankiReviews ? addAppNameToReviewData(ankiReviews, AppNames.anki) : []),
        ...(wanikaniReviews ? addAppNameToReviewData(wanikaniReviews, AppNames.wanikani) : []),
    ]
        .filter(review => review.date >= truncDate(Date.now()) && review.date < truncDate(Date.now() + daysToMillis(days)))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    let data = [];

    for (const review of reviews) {
        const date = truncDate(review.date.getTime());
        const index = data.findIndex(v => v.date.getTime() === date.getTime());

        if (index == -1) {
            const dp = new DataPoint(date);
            dp.addReview(review.appName);
            data.push(dp);
        } else {
            data[index].addReview(review.appName);
        }
    }

    return data;
}

async function fetchWanikaniReviews() {
    const rawData = await WanikaniApiService.getAllAssignments()
    const data = rawData.filter(assignment => !assignment.data['burned_at'] || !assignment.data['available_at']);

    return data
        .filter(assignment => new Date(assignment.data['available_at']) > addDays(new Date(), -1))
        .map(assignment => ({...assignment, date: new Date(assignment.data['available_at'])}));
}

function OverviewUpcomingReviewsChart() {
    const ankiSeriesName = 'Anki';
    const bunProSeriesName = 'BunPro';
    const wanikaniSeriesName = 'Wanikani';

    const [toolTipTargetItem, setToolTipTargetItem] = useState();
    const [days, setDays] = useState(14);

    const isAnkiConnected = useAnkiConnection();
    const {selectedDecks: ankiSelectedDecks} = useSelectedAnkiDecks();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();


    const [ankiReviews, setAnkiReviews] = useState(null);
    const [bunProReviews, setBunProReviews] = useState(null);
    const [wanikaniReviews, setWanikaniReviews] = useState(null);

    const [isAnkiLoading, setIsAnkiLoading] = useState(false);
    const [isBunProLoading, setIsBunProLoading] = useState(false);
    const [isWanikaniLoading, setIsWanikaniLoading] = useState(false);

    const isLoading = isAnkiLoading || isWanikaniLoading || isBunProLoading;
    const noAppsConnected = !ankiReviews && !bunProReviews && !wanikaniReviews;


    useEffect(() => {
        if (!wanikaniApiKey)
            return;
        setIsWanikaniLoading(true);
        let isSubscribed = true;
        fetchWanikaniReviews()
            .then(reviews => {
                if (!isSubscribed)
                    return;
                setWanikaniReviews(reviews);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsWanikaniLoading(false);
            });
        return () => isSubscribed = false;
    }, [wanikaniApiKey]);

    useEffect(() => {
        if (!bunProApiKey)
            return;
        setIsBunProLoading(true);
        let isSubscribed = true;
        getBunProReviews()
            .then(reviews => {
                if (!isSubscribed)
                    return;
                setBunProReviews(reviews);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsBunProLoading(false);
            });
        return () => isSubscribed = false;
    }, [bunProApiKey]);

    useEffect(() => {
        if (!isAnkiConnected || !ankiSelectedDecks || ankiSelectedDecks.length === 0) {
            setAnkiReviews(null);
            return;
        }
        setIsAnkiLoading(true);
        let isSubscribed = true;
        getAnkiReviews(ankiSelectedDecks, days)
            .then(reviews => {
                if (!isSubscribed)
                    return;
                setAnkiReviews(reviews);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsAnkiLoading(false);
            });
        return () => isSubscribed = false;
    }, [isAnkiConnected, ankiSelectedDecks, days]);

    const chartData = useMemo(
        () => aggregateData(ankiReviews, bunProReviews, wanikaniReviews, days),
        [ankiReviews, bunProReviews, wanikaniReviews, days]
    );


    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 14);

    function LabelWithDate(props) {
        const dateAsString = props.text;
        if (!dateAsString) {
            return (<></>);
        }
        const date = new Date(dateAsString)
        const index = chartData.findIndex(d => d.date.getTime() === date.getTime());
        if (!visibleLabelIndices.includes(index)) {
            return (<></>);
        }

        return (
            <ArgumentAxis.Label
                {...props}
                text={(date.getMonth() + 1) + '/' + (date.getDate())}
            />
        );
    }

    function ReviewsToolTip({targetItem}) {
        const dp = chartData[targetItem.point];
        return (
            <>
                <p>Date: {dp.date.toLocaleDateString()}</p>
                {dp.ankiCount > 0 ? (<p>Anki: {dp.ankiCount}</p>) : null}
                {dp.bunProCount > 0 ? (<p>BunPro: {dp.bunProCount}</p>) : null}
                {dp.wanikaniCount > 0 ? (<p>Wanikani: {dp.wanikaniCount}</p>) : null}

            </>
        );
    }

    const showAnkiSeries = isAnkiConnected && !!ankiReviews && ankiReviews.length > 0;
    const showBunProSeries = !!bunProReviews && bunProReviews.length > 0;
    const showWanikaniSeries = !!wanikaniReviews && wanikaniReviews.length > 0;

    function onTooltipChange(target) {
        if (target) {
            if (showWanikaniSeries) {
                target.series = wanikaniSeriesName;
            } else if (showBunProSeries) {
                target.series = bunProSeriesName;
            } else if (showAnkiSeries) {
                target.series = ankiSeriesName;
            }
        }
        setToolTipTargetItem(target);
    }

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Box/>
                        <Typography variant={'h5'}>
                            Upcoming Reviews
                        </Typography>

                        {!noAppsConnected && !isLoading ? (
                            <DaysSelector days={days}
                                          setDays={setDays}
                                          options={[
                                              {value: 7, text: '7'},
                                              {value: 14, text: '14'},
                                              {value: 30, text: '30'},
                                          ]}
                            />
                        ) : (<div/>)}

                    </div>
                    {isLoading ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%'}}>
                            <CircularProgress/>
                        </div>
                    ) : noAppsConnected ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px'}}>
                            No Apps connected
                        </div>
                    ) : (
                        <div style={{flexGrow: '1'}}>
                            <Chart data={chartData}>
                                <ValueAxis/>
                                <ArgumentScale factory={scaleBand}/>
                                <ArgumentAxis labelComponent={LabelWithDate}/>

                                {showAnkiSeries ? (
                                    <BarSeries
                                        name={ankiSeriesName}
                                        valueField="ankiCount"
                                        argumentField="date"
                                        color={AnkiColors.lightGreen}
                                    />
                                ) : null}

                                {showBunProSeries ? (
                                    <BarSeries
                                        name={bunProSeriesName}
                                        valueField="bunProCount"
                                        argumentField="date"
                                        color={BunProColors.blue}
                                    />
                                ) : null}

                                {showWanikaniSeries ? (
                                    <BarSeries
                                        name={wanikaniSeriesName}
                                        valueField="wanikaniCount"
                                        argumentField="date"
                                        color={WanikaniColors.pink}
                                    />
                                ) : null}

                                <Stack
                                    stacks={[{series: ['Anki', 'BunPro', 'Wanikani']}]}
                                />

                                <Legend/>
                                <EventTracker/>
                                <Tooltip targetItem={toolTipTargetItem}
                                         onTargetItemChange={onTooltipChange}
                                         contentComponent={ReviewsToolTip}
                                />
                                <Animation/>
                            </Chart>
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    );
}

export default OverviewUpcomingReviewsChart;