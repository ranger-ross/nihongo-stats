import {Chart, ValueAxis, ArgumentAxis, Tooltip, Legend} from '@devexpress/dx-react-chart-material-ui';
import {useState, useEffect, useMemo} from "react";
import {ArgumentScale, BarSeries, Stack} from "@devexpress/dx-react-chart";
import {
    AnkiColors,
    AppNames,
    BunProColors,
    WanikaniColors
} from '../../Constants.js';
import {Card, CardContent, Typography, Grid, CircularProgress} from "@mui/material";
import {EventTracker} from "@devexpress/dx-react-chart";
import {scaleBand} from 'd3-scale';
import React from 'react';
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import DaysSelector from "../../shared/DaysSelector.jsx";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService.js";
import {daysToMillis, truncDate} from "../../util/DateUtils.js";
import AnkiApiService from "../../anki/service/AnkiApiService.js";
import {useAnkiDecks} from "../../hooks/useAnkiDecks.jsx";
import {fetchAllBunProReviews} from "../../bunpro/service/BunProDataUtil.js";
import {useAnkiConnection} from "../../hooks/useAnkiConnection.jsx";
import {createSubjectMap} from "../../wanikani/service/WanikaniDataUtil.js";

function DataPoint(date) {
    let data = {
        date: date,
        ankiData: [],
        anki: 0,
        bunProData: [],
        bunPro: 0,
        wanikaniData: [],
        wanikani: 0,
    };

    data.addAnki = (d) => {
        data.ankiData.push(d);
        data.anki = data.ankiData.length;
    };

    data.addBunPro = (d) => {
        data.bunProData.push(d);
        data.bunPro = data.bunProData.length;
    };

    data.addWanikani = (d) => {
        data.wanikaniData.push(d);
        data.wanikani = data.wanikaniData.length;
    };

    return data;
}

async function fetchWanikaniData() {
    const reviews = await WanikaniApiService.getReviews();
    const subjects = createSubjectMap(await WanikaniApiService.getSubjects());
    let data = [];
    for (const review of reviews) {
        data.push({
            date: new Date(review['data_updated_at']),
            review: review,
            subject: subjects[review.data['subject_id']]
        });
    }

    return data;
}

function addAppNameToReviewData(data, appName) {
    return data.map(review => ({...review, appName}));
}

function aggregateDate(ankiReviews, bunProReviews, wanikaniReviews, daysToLookBack) {
    const reviews = [
        ...(bunProReviews ? addAppNameToReviewData(bunProReviews, AppNames.bunpro) : []),
        ...(ankiReviews ? addAppNameToReviewData(ankiReviews, AppNames.anki) : []),
        ...(wanikaniReviews ? addAppNameToReviewData(wanikaniReviews, AppNames.wanikani) : []),
    ]
        .filter(review => review.date > truncDate(Date.now() - daysToMillis(daysToLookBack)))
        .sort((a, b) => a.date.getTime() - b.date.getTime());


    if (reviews.length == 0) {
        return [];
    }

    let aggregatedDate = [new DataPoint(truncDate(reviews[0].date))];
    for (const data of reviews) {
        if (aggregatedDate[aggregatedDate.length - 1].date.getTime() != truncDate(data.date).getTime()) {
            aggregatedDate.push(new DataPoint(truncDate(data.date)));
        }

        const lastDay = aggregatedDate[aggregatedDate.length - 1];

        if (data.appName === AppNames.wanikani) {
            lastDay.addWanikani(data);
        } else if (data.appName === AppNames.anki) {
            lastDay.addAnki(data);
        } else if (data.appName === AppNames.bunpro) {
            lastDay.addBunPro(data);
        }
    }

    return aggregatedDate;
}

async function fetchAnkiReviews(ankiDecks) {
    let reviewPromises = [];
    ankiDecks.forEach(name => reviewPromises.push(AnkiApiService.getAllReviewsByDeck(name)));
    const data = await Promise.all(reviewPromises)
    return data
        .reduce((a, c) => [...a, ...c], [])
        .map(review => ({
            ...review,
            date: new Date(review.reviewTime),
        }));
}

async function fetchBunProData() {
    const reviews = await fetchAllBunProReviews();
    return reviews
        .map(review => ({...review, date: new Date(review.current.time)}))
        .sort((a, b,) => a.date.getTime() - b.date.getTime());
}

function calculateLabelPositions(data) {
    const numberOfLabels = data.length == 7 ? 7 : 6
    return getVisibleLabelIndices(data, numberOfLabels);
}

function OverviewReviewsHistoryChart() {
    const ankiSeriesName = 'Anki';
    const bunProSeriesName = 'BunPro';
    const wanikaniSeriesName = 'Wanikani';

    const isAnkiConnected = useAnkiConnection();

    const [toolTipTargetItem, setToolTipTargetItem] = useState();
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const [ankiDecks] = useAnkiDecks();

    const [ankiReviews, setAnkiReviews] = useState([]);
    const [bunProReviews, setBunProReviews] = useState([]);
    const [wanikaniReviews, setWanikaniReviews] = useState([]);

    const [isAnkiLoading, setIsAnkiLoading] = useState(false);
    const [isBunProLoading, setIsBunProLoading] = useState(false);
    const [isWanikaniLoading, setIsWanikaniLoading] = useState(false);

    const isLoading = isAnkiLoading || isWanikaniLoading || isBunProLoading;


    const chartData = useMemo(
        () => aggregateDate(ankiReviews, bunProReviews, wanikaniReviews, daysToLookBack),
        [wanikaniReviews, bunProReviews, ankiReviews, daysToLookBack]
    );


    useEffect(() => {
        setIsWanikaniLoading(true);
        let isSubscribed = true;
        fetchWanikaniData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setWanikaniReviews(data);
                setIsWanikaniLoading(false);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, []);


    useEffect(() => {
        setIsBunProLoading(true);
        let isSubscribed = true;
        fetchBunProData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setBunProReviews(data);
                setIsBunProLoading(false);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, []);

    useEffect(() => {
        if (!isAnkiConnected) {
            if (ankiReviews?.length > 0) {
                setAnkiReviews([]);
            }
            return;
        }

        let isSubscribed = true;
        setIsAnkiLoading(true);
        fetchAnkiReviews(ankiDecks)
            .then(reviews => {
                if (!isSubscribed)
                    return;
                setAnkiReviews(reviews);
            })
            .finally(() => setIsAnkiLoading(false));
        return () => isSubscribed = false;
    }, [ankiDecks, isAnkiConnected]);

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

    function ReviewsToolTip({targetItem}) {
        const dp = chartData[targetItem.point];
        return (
            <>
                <p>Date: {dp.date.toLocaleDateString()}</p>
                {dp.anki > 0 ? (<p>Anki: {dp.anki}</p>) : null}
                {dp.bunPro > 0 ? (<p>BunPro: {dp.bunPro}</p>) : null}
                {dp.wanikani > 0 ? (<p>Wanikani: {dp.wanikani}</p>) : null}

            </>
        );
    }

    const visibleLabelIndices = calculateLabelPositions(chartData);

    const LabelWithDate = (props) => {
        const date = props.text;
        if (!date) {
            return (<></>);
        }

        const index = chartData.findIndex(d => d.date === date);

        if (!visibleLabelIndices.includes(index)) {
            return (<></>);
        }

        return (
            <>
                <ArgumentAxis.Label
                    {...props}
                    text={new Date(date).toLocaleDateString()}
                />
            </>
        );
    };

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <Grid container>
                        <Grid item xs={12} md={4}/>
                        <Grid item xs={12} md={4}>
                            <Typography variant={'h5'} style={{textAlign: 'center', paddingBottom: '5px'}}>
                                Review History
                            </Typography>
                        </Grid>


                        {isLoading ? (
                            <Grid item container xs={12} justifyContent={'center'} style={{padding: '10px'}}>
                                <CircularProgress/>
                            </Grid>
                        ) : (
                            <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                                <DaysSelector days={daysToLookBack}
                                              setDays={setDaysToLookBack}
                                              options={[
                                                  {value: 7, text: '7'},
                                                  {value: 14, text: '14'},
                                                  {value: 30, text: '30'},
                                                  {value: 90, text: '3 Mon'},
                                                  {value: 180, text: '6 Mon'},
                                                  {value: 365, text: '1 Yr'},
                                                  {value: 10_000, text: 'All'},
                                              ]}
                                />
                            </Grid>
                        )}
                    </Grid>

                    {!isLoading && !!chartData ? (
                        <div style={{flexGrow: '1'}}>
                            <Chart data={chartData}>
                                <ArgumentScale factory={scaleBand}/>
                                <ArgumentAxis labelComponent={LabelWithDate}/>
                                <ValueAxis/>

                                {showAnkiSeries ? (
                                    <BarSeries
                                        name="Anki"
                                        valueField="anki"
                                        argumentField="date"
                                        color={AnkiColors.lightGreen}
                                    />
                                ) : null}

                                {showBunProSeries ? (
                                    <BarSeries
                                        name="BunPro"
                                        valueField="bunPro"
                                        argumentField="date"
                                        color={BunProColors.blue}
                                    />
                                ) : null}

                                {showWanikaniSeries ? (
                                    <BarSeries
                                        name="Wanikani"
                                        valueField="wanikani"
                                        argumentField="date"
                                        color={WanikaniColors.pink}
                                    />
                                ) : null}

                                <Stack
                                    stacks={[{series: ['Anki', "BunPro", 'Wanikani']}]}
                                />

                                <Legend/>
                                <EventTracker/>
                                <Tooltip
                                    targetItem={toolTipTargetItem}
                                    onTargetItemChange={onTooltipChange}
                                    contentComponent={ReviewsToolTip}
                                />
                            </Chart>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export default OverviewReviewsHistoryChart;