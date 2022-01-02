import React, {useEffect, useMemo, useState} from "react";
import {Box, Card, CardContent, Typography} from "@mui/material";
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
import {ankiAppName, bunproAppName, wanikaniAppName} from "../../Constants.js";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService.js";

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
        if (appName === ankiAppName)
            dp.ankiCount += 1;
        else if (appName === bunproAppName)
            dp.bunProCount += 1;
        else if (appName === wanikaniAppName)
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
        const day = i % numberOfDays;
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
        ...(bunProReviews ? addAppNameToReviewData(bunProReviews, bunproAppName) : []),
        ...(ankiReviews ? addAppNameToReviewData(ankiReviews, ankiAppName) : []),
        ...(wanikaniReviews ? addAppNameToReviewData(wanikaniReviews, wanikaniAppName) : []),
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
    const [targetItem, setTargetItem] = useState();
    const [days, setDays] = useState(14);

    const {selectedDecks: ankiSelectedDecks} = useSelectedAnkiDecks();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();


    const [ankiReviews, setAnkiReviews] = useState(null);
    const [bunProReviews, setBunProReviews] = useState(null);
    const [wanikaniReviews, setWanikaniReviews] = useState(null);

    useEffect(() => {
        if (!wanikaniApiKey)
            return;
        let isSubscribed = true;
        fetchWanikaniReviews()
            .then(reviews => {
                if (!isSubscribed)
                    return;
                setWanikaniReviews(reviews);
            })
        return () => isSubscribed = false;
    }, [wanikaniApiKey]);

    useEffect(() => {
        if (!bunProApiKey)
            return;
        let isSubscribed = true;
        getBunProReviews()
            .then(reviews => {
                if (!isSubscribed)
                    return;
                setBunProReviews(reviews);
            })
        return () => isSubscribed = false;
    }, [bunProApiKey]);

    useEffect(() => {
        if (!ankiSelectedDecks || ankiSelectedDecks.length === 0)
            return;
        let isSubscribed = true;
        getAnkiReviews(ankiSelectedDecks, days)
            .then(reviews => {
                if (!isSubscribed)
                    return;
                setAnkiReviews(reviews);
            })
        return () => isSubscribed = false;
    }, [ankiSelectedDecks, days]);

    const chartData = useMemo(
        () => aggregateData(ankiReviews, bunProReviews, wanikaniReviews, days),
        [ankiReviews, bunProReviews, wanikaniReviews, days]
    );

    console.log(chartData);

    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 14);

    const LabelWithDate = (props) => {
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
    };

    function ReviewsToolTip({targetItem}) {
        const dp = chartData[targetItem.point];

        // TODO: Add tool tip content

        return (
            <>
                <p>Date: {dp.date.toLocaleDateString()}</p>
            </>
        );
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

                        <DaysSelector days={days}
                                      setDays={setDays}
                                      options={[
                                          {value: 7, text: '7'},
                                          {value: 14, text: '14'},
                                          {value: 30, text: '30'},
                                      ]}
                        />
                    </div>

                    <div style={{flexGrow: '1'}}>
                        <Chart data={chartData}>
                            <ValueAxis/>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate}/>

                            <BarSeries
                                name="Anki"
                                valueField="ankiCount"
                                argumentField="date"
                            />

                            <BarSeries
                                name="BunPro"
                                valueField="bunProCount"
                                argumentField="date"
                            />


                            <BarSeries
                                name="Wanikani"
                                valueField="wanikaniCount"
                                argumentField="date"
                            />

                            <Stack
                                stacks={[{series: ['Anki', 'BunPro', 'Wanikani']}]}
                            />

                            <Legend/>
                            <EventTracker/>
                            <Tooltip targetItem={targetItem}
                                     onTargetItemChange={setTargetItem}
                                     contentComponent={ReviewsToolTip}
                            />
                            <Animation/>
                        </Chart>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default OverviewUpcomingReviewsChart;