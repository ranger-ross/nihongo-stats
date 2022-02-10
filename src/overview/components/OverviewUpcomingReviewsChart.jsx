import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addDays, addHours, daysToMillis, truncDate, truncMinutes} from '../../util/DateUtils.js';
import DaysSelector from "../../shared/DaysSelector.jsx";
import {scaleBand} from 'd3-scale';
import BunProApiService from "../../bunpro/service/BunProApiService.js";
import {ArgumentAxis, Chart, ScatterSeries, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {
    ArgumentScale,
    BarSeries,
    EventTracker,
    LineSeries,
    Stack,
    ValueScale
} from "@devexpress/dx-react-chart";
import AnkiApiService from "../../anki/service/AnkiApiService.js";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.jsx";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey.jsx";
import {useBunProApiKey} from "../../hooks/useBunProApiKey.jsx";
import {createAnkiCardsDueQuery} from "../../anki/service/AnkiDataUtil.js";
import {AnkiColors, AppNames, BunProColors, WanikaniColors} from "../../Constants.js";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService.js";
import {useAnkiConnection} from "../../hooks/useAnkiConnection.jsx";
import {
    addTimeToDate, createUpcomingReviewsChartBarLabel, createUpcomingReviewsChartLabel, formatTimeUnitLabelText,
    UnitSelector,
    UpcomingReviewPeriods,
    UpcomingReviewUnits
} from "../../util/UpcomingReviewChartUtils.jsx";
import ToolTipLabel from "../../shared/ToolTipLabel.jsx";
import {filterDeadGhostReviews} from "../../bunpro/service/BunProDataUtil.js";
import FilterableLegend from "../../shared/FilterableLegend.jsx";

const maxDaysIntoFuture = 31;

function DataPoint(date, unit, reviews, previousDataPoint) {
    let dp = {
        date: unit.trunc(date).getTime(),
        bunProCount: 0,
        wanikaniCount: 0,
        ankiCount: 0,
        total: reviews.length,
    };

    if (!!previousDataPoint)
        dp.total += previousDataPoint.total;

    dp.addReview = (appName) => {
        if (appName === AppNames.anki)
            dp.ankiCount += 1;
        else if (appName === AppNames.bunpro)
            dp.bunProCount += 1;
        else if (appName === AppNames.wanikani)
            dp.wanikaniCount += 1;
    };

    for (const review of reviews) {
        dp.addReview(review.appName);
    }

    return dp;
}

async function getBunProReviews() {
    const reviewData = await BunProApiService.getAllReviews();
    return [...reviewData['reviews'], ...reviewData['ghost_reviews']]
        .filter(filterDeadGhostReviews)
        .map(review => ({...review, date: new Date(review['next_review'])}));
}

async function getAnkiReviews(decks) {
    let actions = [];
    for (let i = 0; i < maxDaysIntoFuture; i++) {       // <== Use 31 days since it is more that the max,
        for (const deck of decks) {      //     we dont want to constantly reload this when user changes period
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
        .filter(review => review.date >= unit.trunc(Date.now()) && review.date < unit.trunc(Date.now() + daysToMillis(maxDaysIntoFuture)))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    let data = [];
    for (let i = 0; i < period; i++) {
        const time = addTimeToDate(getChartStartTime(), unit, i);
        const reviewsInPeriod = reviews.filter(review => unit.isPeriodTheSame(unit.trunc(review.date), time, unit));
        data.push(new DataPoint(time, unit, reviewsInPeriod, data[i - 1]));
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

function useAnkiReviews(isAnkiConnected) {
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
        getAnkiReviews(ankiSelectedDecks)
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
    }, [isAnkiConnected, ankiSelectedDecks]);

    return [ankiReviews, isAnkiLoading];
}

const ankiSeriesName = 'Anki';
const bunProSeriesName = 'BunPro';
const wanikaniSeriesName = 'Wanikani';

function OverviewUpcomingReviewsChart() {
    const [toolTipTargetItem, setToolTipTargetItem] = useState();
    const [period, setPeriod] = useState(UpcomingReviewUnits.hours.default);
    const [unit, setUnit] = useState(UpcomingReviewUnits.hours);

    const isAnkiConnected = useAnkiConnection();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();

    const [ankiReviews, isAnkiLoading] = useAnkiReviews(isAnkiConnected);
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

            const isTotal = targetItem.series.toLowerCase().startsWith('total');

            return (
                <>
                    <ToolTipLabel
                        title={unit.key == UpcomingReviewUnits.hours.key ? 'Time' : 'Date'}
                        value={formatTimeUnitLabelText(unit, dp.date, true)}
                    />
                    {isTotal ? (
                        <ToolTipLabel title="Total" value={dp.total}/>
                    ) : (
                        <>
                            {dp.ankiCount > 0 ? (<ToolTipLabel title="Anki" value={dp.ankiCount}/>) : null}
                            {dp.bunProCount > 0 ? (<ToolTipLabel title="BunPro" value={dp.bunProCount}/>) : null}
                            {dp.wanikaniCount > 0 ? (<ToolTipLabel title="Wanikani" value={dp.wanikaniCount}/>) : null}
                        </>
                    )}
                </>
            );
        }
    ), [chartData]);

    const showAnkiSeries = isAnkiConnected && !!ankiReviews && ankiReviews.length > 0;
    const showBunProSeries = !!bunProReviews && bunProReviews.length > 0;
    const showWanikaniSeries = !!wanikaniReviews && wanikaniReviews.length > 0;

    function onTooltipChange(target) {
        function getTopSeries(targetItem, chartData) {
            const dp = chartData[targetItem.point];
            if (showWanikaniSeries && dp.wanikaniCount > 0)
                return wanikaniSeriesName;
            else if (showBunProSeries && dp.bunProCount > 0)
                return bunProSeriesName;
            else
                return ankiSeriesName;
        }

        if (target) {
            if (!target.series.toLowerCase().includes('total')) {
                target.series = getTopSeries(target, chartData);
            }
            if (target.series.toLowerCase() == 'total-points') {
                target.series = 'Total';
            }
        }
        setToolTipTargetItem(target);
    }

    const BarWithLabel = useMemo(() => {
        let series = [];

        if (showAnkiSeries)
            series.push('anki');

        if (showBunProSeries)
            series.push('bunpro');

        if (showWanikaniSeries)
            series.push('wanikani');

        const ankiIndex = series.indexOf('anki');
        const bunProIndex = series.indexOf('bunpro');
        const wanikaniIndex = series.indexOf('wanikani');

        return createUpcomingReviewsChartBarLabel((seriesIndex, index) => {
            const dp = chartData[index];

            if (dp.wanikaniCount > 0)
                return wanikaniIndex === seriesIndex;

            if (dp.bunProCount > 0)
                return bunProIndex === seriesIndex;

            if (dp.ankiCount > 0)
                return ankiIndex === seriesIndex;

            return false;
        });
    }, [chartData, showAnkiSeries, showBunProSeries, showWanikaniSeries]);

    const maxScale = useMemo(() => {
        const totals = chartData.map(dp => dp.ankiCount + dp.bunProCount + dp.wanikaniCount);
        return Math.max(5, ...totals) * 1.15;
    }, [chartData]);

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>

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
                                <ValueScale name="total"
                                            modifyDomain={() => [0, chartData.length > 0 ? chartData[chartData.length - 1].total : 1]}/>

                                <ValueScale name="daily"
                                            modifyDomain={() => [0, maxScale]}/>

                                <ValueAxis scaleName="total"/>
                                <ArgumentScale factory={scaleBand}/>
                                <ArgumentAxis labelComponent={LabelWithDate}/>

                                {showAnkiSeries ? (
                                    <BarSeries
                                        name={ankiSeriesName}
                                        valueField="ankiCount"
                                        argumentField="date"
                                        scaleName="daily"
                                        color={AnkiColors.lightGreen}
                                        pointComponent={BarWithLabel}
                                    />
                                ) : null}

                                {showBunProSeries ? (
                                    <BarSeries
                                        name={bunProSeriesName}
                                        valueField="bunProCount"
                                        argumentField="date"
                                        scaleName="daily"
                                        color={BunProColors.blue}
                                        pointComponent={BarWithLabel}
                                    />
                                ) : null}

                                {showWanikaniSeries ? (
                                    <BarSeries
                                        name={wanikaniSeriesName}
                                        valueField="wanikaniCount"
                                        argumentField="date"
                                        scaleName="daily"
                                        color={WanikaniColors.pink}
                                        pointComponent={BarWithLabel}
                                    />
                                ) : null}

                                <LineSeries
                                    name="Total"
                                    valueField="total"
                                    argumentField="date"
                                    color={'#a45bff'}
                                    scaleName="total"
                                />

                                <ScatterSeries
                                    name="total-points"
                                    valueField="total"
                                    argumentField="date"
                                    color={'#a45bff'}
                                    scaleName="total"
                                />

                                <Stack
                                    stacks={[{series: ['Anki', 'BunPro', 'Wanikani']}]}
                                />

                                <FilterableLegend
                                    filterItems={[
                                        'total-points'
                                    ]}
                                />
                                <EventTracker/>
                                <Tooltip targetItem={toolTipTargetItem}
                                         onTargetItemChange={onTooltipChange}
                                         contentComponent={ReviewsToolTip}
                                />
                            </Chart>
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    );
}

export default OverviewUpcomingReviewsChart;