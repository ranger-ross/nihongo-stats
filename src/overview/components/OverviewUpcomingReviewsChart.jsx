import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addDays, addHours, daysToMillis, truncDate, truncMinutes} from '../../util/DateUtils.js';
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
import {AnkiColors, AppNames, BunProColors, WanikaniColors} from "../../Constants.js";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService.js";
import {useAnkiConnection} from "../../hooks/useAnkiConnection.jsx";
import {
    addTimeToDate, createUpcomingReviewsChartLabel, formatTimeUnitLabelText,
    UnitSelector,
    UpcomingReviewPeriods,
    UpcomingReviewUnits
} from "../../util/UpcomingReviewChartUtils.jsx";
import ToolTipLabel from "../../shared/ToolTipLabel.jsx";

function filterDeadGhostReviews(review) {
    const fiveYearsFromNow = Date.now() + (1000 * 60 * 60 * 24 * 365 * 5)
    return new Date(review['next_review']).getTime() < fiveYearsFromNow;
}

function DataPoint(date, unit) {
    let dp = {
        date: unit.trunc(date).getTime(),
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


function getChartStartTime() { // Start chart at the beginning of the next hour
    return addHours(truncMinutes(new Date()), 1);
}

function aggregateData(ankiReviews, bunProReviews, wanikaniReviews, period, unit) {
    const reviews = [
        ...(bunProReviews ? addAppNameToReviewData(bunProReviews, AppNames.bunpro) : []),
        ...(ankiReviews ? addAppNameToReviewData(ankiReviews, AppNames.anki) : []),
        ...(wanikaniReviews ? addAppNameToReviewData(wanikaniReviews, AppNames.wanikani) : []),
    ]
        .filter(review => review.date >= unit.trunc(Date.now()) && review.date < unit.trunc(Date.now() + daysToMillis(period)))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    let data = [];
    for (let i = 0; i < period; i++) {
        const time = addTimeToDate(getChartStartTime(), unit, i);
        const reviewsInPeriod = reviews.filter(review => unit.isPeriodTheSame(unit.trunc(review.date), time, unit));

        const dp = new DataPoint(time, unit);
        for (const review of reviewsInPeriod) {
            dp.addReview(review.appName);
        }
        data.push(dp);
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

function useWanikaniReviews(wanikaniApiKey) {
    const [wanikaniReviews, setWanikaniReviews] = useState(null);
    const [isWanikaniLoading, setIsWanikaniLoading] = useState(false);

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

    return [wanikaniReviews, isWanikaniLoading];
}

function useBunProReviews(bunProApiKey) {
    const [bunProReviews, setBunProReviews] = useState(null);
    const [isBunProLoading, setIsBunProLoading] = useState(false);

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

    return [bunProReviews, isBunProLoading];
}

function useAnkiReviews(isAnkiConnected, days) {
    const {selectedDecks: ankiSelectedDecks} = useSelectedAnkiDecks();
    const [ankiReviews, setAnkiReviews] = useState(null);
    const [isAnkiLoading, setIsAnkiLoading] = useState(false);

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

    return [ankiReviews, isAnkiLoading];
}

function OverviewUpcomingReviewsChart() {
    const ankiSeriesName = 'Anki';
    const bunProSeriesName = 'BunPro';
    const wanikaniSeriesName = 'Wanikani';

    const [toolTipTargetItem, setToolTipTargetItem] = useState();
    const [period, setPeriod] = useState(UpcomingReviewUnits.days.default);
    const [unit, setUnit] = useState(UpcomingReviewUnits.days);

    const isAnkiConnected = useAnkiConnection();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();

    const [ankiReviews, isAnkiLoading] = useAnkiReviews(isAnkiConnected, period); // todo: convert period to days
    const [bunProReviews, isBunProLoading] = useBunProReviews(bunProApiKey);
    const [wanikaniReviews, isWanikaniLoading] = useWanikaniReviews(wanikaniApiKey);

    const isLoading = isAnkiLoading || isWanikaniLoading || isBunProLoading;
    const noAppsConnected = !ankiReviews && !bunProReviews && !wanikaniReviews;

    const chartData = useMemo(
        () => aggregateData(ankiReviews, bunProReviews, wanikaniReviews, period, unit),
        [ankiReviews, bunProReviews, wanikaniReviews, period, unit.key]
    );

    const LabelWithDate = useMemo(() => createUpcomingReviewsChartLabel(unit), [unit]);

    const ReviewsToolTip = useMemo(() => (
        function ReviewsToolTip({targetItem}) {
            const dp = chartData[targetItem.point];
            return (
                <>
                    <ToolTipLabel
                        title={unit.key == UpcomingReviewUnits.hours.key ? 'Time' : 'Date'}
                        value={formatTimeUnitLabelText(unit, dp.date, true)}
                    />
                    {dp.ankiCount > 0 ? (<ToolTipLabel title="Anki" value={dp.ankiCount}/>) : null}
                    {dp.bunProCount > 0 ? (<ToolTipLabel title="BunPro" value={dp.bunProCount}/>) : null}
                    {dp.wanikaniCount > 0 ? (<ToolTipLabel title="Wanikani" value={dp.wanikaniCount}/>) : null}
                </>
            );
        }
    ), [chartData]);

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

                        <UnitSelector
                            unit={unit}
                            onChange={unit => {
                                setPeriod(unit.default);
                                setUnit(unit);
                            }}
                            options={[
                                UpcomingReviewUnits.hours,
                                UpcomingReviewUnits.days,
                            ]}
                        />
                        <Typography variant={'h5'}>
                            Upcoming Reviews
                        </Typography>

                        {!noAppsConnected && !isLoading ? (
                            <DaysSelector days={period}
                                          setDays={setPeriod}
                                          options={unit === UpcomingReviewUnits.days ? UpcomingReviewPeriods.days : UpcomingReviewPeriods.hours}
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