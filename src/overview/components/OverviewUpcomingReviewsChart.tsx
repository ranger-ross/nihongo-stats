import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addDays, addHours, daysToMillis, truncDate, truncMinutes} from '../../util/DateUtils';
import PeriodSelector from "../../shared/PeriodSelector";
// @ts-ignore
import {scaleBand} from 'd3-scale';
import BunProApiService from "../../bunpro/service/BunProApiService";
import {ArgumentAxis, Chart, ScatterSeries, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {
    ArgumentScale,
    BarSeries,
    EventTracker,
    LineSeries,
    SeriesRef,
    Stack,
    ValueScale
} from "@devexpress/dx-react-chart";
import AnkiApiService from "../../anki/service/AnkiApiService";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey";
import {useBunProApiKey} from "../../hooks/useBunProApiKey";
import {createAnkiCardsDueQuery, fetchAnkiDeckSummaries} from "../../anki/service/AnkiDataUtil";
import {AnkiColors, AppNames, BunProColors, WanikaniColors} from "../../Constants";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService";
import {useAnkiConnection} from "../../hooks/useAnkiConnection";
import {
    addTimeToDate,
    createUpcomingReviewsChartBarLabel,
    createUpcomingReviewsChartLabel,
    formatTimeUnitLabelText,
    UnitSelector,
    UpcomingReviewPeriods,
    UpcomingReviewsScatterPoint,
    UpcomingReviewUnit,
    UpcomingReviewUnits
} from "../../util/UpcomingReviewChartUtils";
import ToolTipLabel from "../../shared/ToolTipLabel";
import {filterDeadGhostReviews} from "../../bunpro/service/BunProDataUtil";
import FilterableLegend from "../../shared/FilterableLegend";
import {useDeviceInfo} from "../../hooks/useDeviceInfo";
import {AppStyles} from "../../util/TypeUtils";
import {AnkiReview} from "../../anki/models/AnkiReview";
import {RawBunProReview} from "../../bunpro/models/raw/RawBunProReview";
import {RawWanikaniAssignment} from "../../wanikani/models/raw/RawWanikaniAssignment";

const maxDaysIntoFuture = 31;

const styles: AppStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
        alignItems: 'center'
    }
};

type DataPoint = {
    date: number,
    bunProCount: number,
    wanikaniCount: number,
    ankiCount: number,
    total: number,
    addReview: (appName: string) => void
};

function dataPoint(date: Date, unit: UpcomingReviewUnit, reviews: any[], previousDataPoint?: DataPoint) {
    const dp: DataPoint = {
        date: unit.trunc(date).getTime(),
        bunProCount: 0,
        wanikaniCount: 0,
        ankiCount: 0,
        total: reviews.length,
        addReview: (appName: string) => null
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

type BunProDateReview = RawBunProReview & {
    date: Date
}

async function getBunProReviews(): Promise<BunProDateReview[]> {
    const reviewData = await BunProApiService.getAllReviews();
    return [...reviewData['reviews'], ...reviewData['ghost_reviews']]
        .filter(filterDeadGhostReviews)
        .map(review => ({...review, date: new Date(review['next_review'])}));
}

type AnkiDateReview = { date: Date, review: AnkiReview }

async function getAnkiReviews(decks: string[]) {
    const actions = [];
    for (let i = 0; i < maxDaysIntoFuture; i++) {       // <== Use 31 days since it is more that the max,
        for (const deck of decks) {      //     we dont want to constantly reload this when user changes period
            actions.push(createAnkiCardsDueQuery(deck, i));
        }
    }

    const listOfListDueCards: AnkiReview[][] = await AnkiApiService.sendMultiRequest(actions);

    const data: AnkiDateReview[] = [];

    for (let i = 0; i < listOfListDueCards.length; i++) {
        const day = Math.floor(i / decks.length);
        const date = truncDate(Date.now() + daysToMillis(day));

        data.push(...listOfListDueCards[i]
            .map(review => ({date, review})));
    }

    return data;
}

function addAppNameToReviewData(data: any[], appName: string) {
    return data.map(review => ({...review, appName}));
}

function getChartStartTime() { // Start chart at the beginning of the next hour
    return addHours(truncMinutes(new Date()), 1);
}

function aggregateData(ankiReviews: AnkiDateReview[], bunProReviews: BunProDateReview[], wanikaniReviews: WanikaniDateReview[],
                       period: number, unit: UpcomingReviewUnit, ankiInitialReviewCount: number, bunProInitialReviewCount: number, wanikaniInitialReviewCount: number) {
    const reviews = [
        ...(bunProReviews ? addAppNameToReviewData(bunProReviews, AppNames.bunpro) : []),
        ...(ankiReviews ? addAppNameToReviewData(ankiReviews, AppNames.anki) : []),
        ...(wanikaniReviews ? addAppNameToReviewData(wanikaniReviews, AppNames.wanikani) : []),
    ]
        .filter(review => review.date >= unit.trunc(Date.now()) && review.date < unit.trunc(Date.now() + daysToMillis(maxDaysIntoFuture)))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const data: DataPoint[] = [];
    for (let i = 0; i < period; i++) {
        const time = addTimeToDate(getChartStartTime(), unit, i);
        const reviewsInPeriod = reviews.filter(review => unit.isPeriodTheSame(unit.trunc(review.date), time));
        const dp = dataPoint(time, unit, reviewsInPeriod, data[i - 1]);

        if (data.length === 0)
            dp.total += (ankiInitialReviewCount + bunProInitialReviewCount + wanikaniInitialReviewCount);

        data.push(dp);
    }
    return data;
}

type WanikaniDateReview = RawWanikaniAssignment & { date: Date }


async function fetchWanikaniReviews(): Promise<WanikaniDateReview[]> {
    const rawData = await WanikaniApiService.getAllAssignments()
    const data = rawData.filter(assignment => !assignment.data['burned_at'] || !assignment.data['available_at']);

    return data
        .filter(assignment => new Date(assignment.data['available_at']) > addDays(new Date(), -1))
        .map(assignment => ({...assignment, date: new Date(assignment.data['available_at'])}));
}

function useWanikaniReviews(wanikaniApiKey?: string | null) {
    const [wanikaniReviews, setWanikaniReviews] = useState<WanikaniDateReview[] | null>(null);
    const [isWanikaniLoading, setIsWanikaniLoading] = useState(false);
    const [initialReviewCount, setInitialReviewCount] = useState(0);

    useEffect(() => {
        if (!wanikaniApiKey)
            return;
        setIsWanikaniLoading(true);
        let isSubscribed = true;
        Promise.all([
            fetchWanikaniReviews(),
            WanikaniApiService.getPendingLessonsAndReviews(),
        ])
            .then(data => {
                if (!isSubscribed)
                    return;
                setWanikaniReviews(data[0] as WanikaniDateReview[]);
                setInitialReviewCount(data[1].reviews);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsWanikaniLoading(false);
            });
        return () => {
            isSubscribed = false;
        };
    }, [wanikaniApiKey]);

    return {wanikaniReviews, initialReviewCount, isWanikaniLoading};
}

function useBunProReviews(bunProApiKey?: string | null) {
    const [bunProReviews, setBunProReviews] = useState<BunProDateReview[] | null>(null);
    const [isBunProLoading, setIsBunProLoading] = useState(false);
    const [initialReviewCount, setInitialReviewCount] = useState(0);

    useEffect(() => {
        if (!bunProApiKey)
            return;
        setIsBunProLoading(true);
        let isSubscribed = true;

        Promise.all([
            getBunProReviews(),
            BunProApiService.getPendingReviews()
        ])
            .then(([reviews, pendingReviews]) => {
                if (!isSubscribed)
                    return;
                setBunProReviews(reviews as BunProDateReview[]);
                setInitialReviewCount(pendingReviews.length);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsBunProLoading(false);
            });
        return () => {
            isSubscribed = false;
        };
    }, [bunProApiKey]);

    return {bunProReviews, initialReviewCount, isBunProLoading};
}

function useAnkiReviews(isAnkiConnected: boolean) {
    const {selectedDecks: ankiSelectedDecks} = useSelectedAnkiDecks();
    const [ankiReviews, setAnkiReviews] = useState<AnkiDateReview[] | null>(null);
    const [isAnkiLoading, setIsAnkiLoading] = useState(false);
    const [initialReviewCount, setInitialReviewCount] = useState(0);

    useEffect(() => {
        if (!isAnkiConnected || !ankiSelectedDecks || ankiSelectedDecks.length === 0) {
            setAnkiReviews(null);
            return;
        }
        setIsAnkiLoading(true);
        let isSubscribed = true;

        Promise.all([
            getAnkiReviews(ankiSelectedDecks),
            fetchAnkiDeckSummaries(ankiSelectedDecks),
        ])
            .then(data => {
                if (!isSubscribed)
                    return;
                setAnkiReviews(data[0] as AnkiDateReview[]);
                const totalDue = data[1].map(deck => deck.dueCards).reduce((a, c) => a + c);
                setInitialReviewCount(totalDue);
            })
            .finally(() => {
                if (!isSubscribed)
                    return;
                setIsAnkiLoading(false);
            });
        return () => {
            isSubscribed = false;
        };
    }, [isAnkiConnected, ankiSelectedDecks]);

    return {ankiReviews, initialReviewCount, isAnkiLoading};
}

const ankiSeriesName = 'Anki';
const bunProSeriesName = 'BunPro';
const wanikaniSeriesName = 'Wanikani';

function OverviewUpcomingReviewsChart() {
    const [toolTipTargetItem, setToolTipTargetItem] = useState<SeriesRef>();
    const [period, setPeriod] = useState<number>(UpcomingReviewUnits.hours.default);
    const [unit, setUnit] = useState<UpcomingReviewUnit>(UpcomingReviewUnits.hours);
    const {isMobile} = useDeviceInfo();

    const isAnkiConnected = useAnkiConnection();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();

    const {ankiReviews, initialReviewCount: ankiInitialReviewCount, isAnkiLoading} = useAnkiReviews(isAnkiConnected);
    const {
        bunProReviews,
        initialReviewCount: bunProInitialReviewCount,
        isBunProLoading
    } = useBunProReviews(bunProApiKey);
    const {
        wanikaniReviews,
        initialReviewCount: wanikaniInitialReviewCount,
        isWanikaniLoading
    } = useWanikaniReviews(wanikaniApiKey);

    const isLoading = isAnkiLoading || isWanikaniLoading || isBunProLoading;
    const noAppsConnected = !ankiReviews && !bunProReviews && !wanikaniReviews;

    const chartData = useMemo(
        () => aggregateData(ankiReviews ?? [], bunProReviews ?? [], wanikaniReviews ?? [], period, unit, ankiInitialReviewCount, bunProInitialReviewCount, wanikaniInitialReviewCount),
        [ankiReviews, bunProReviews, wanikaniReviews, period, unit.key, ankiInitialReviewCount, bunProInitialReviewCount, wanikaniInitialReviewCount]
    );

    const LabelWithDate = useMemo(() => createUpcomingReviewsChartLabel(unit, isMobile), [unit.key, isMobile]);

    const ReviewsToolTip = useMemo(() => (
        function ReviewsToolTip({targetItem}: Tooltip.ContentProps) {
            const dp = chartData[targetItem.point];

            const isTotal = targetItem.series.toLowerCase().startsWith('total');

            return (
                <>
                    <ToolTipLabel
                        title={unit.key == UpcomingReviewUnits.hours.key ? 'Time' : 'Date'}
                        value={formatTimeUnitLabelText(unit, dp.date, true).primary ?? ''}
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

    function onTooltipChange(target: SeriesRef) {
        function getTopSeries(targetItem: SeriesRef, chartData: DataPoint[]) {
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
                // @ts-ignore
                target.series = getTopSeries(target, chartData);
            }
            if (target.series.toLowerCase() == 'total-points') {
                // @ts-ignore
                target.series = 'Total';
            }
        }
        setToolTipTargetItem(target);
    }

    const BarWithLabel = useMemo(() => {
        const series = [];

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
                <div style={styles.container}>
                    <div style={styles.headerContainer}>

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
                        <Typography variant={'h6'} align={'center'}>
                            Upcoming Reviews
                        </Typography>

                        {!noAppsConnected && !isLoading ? (
                            <PeriodSelector period={period}
                                            setPeriod={setPeriod}
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
                            {/*@ts-ignore*/}
                            <Chart data={chartData} {...(isMobile ? {height: 400} : {})}>
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
                                    pointComponent={UpcomingReviewsScatterPoint}
                                />

                                <Stack
                                    stacks={[{series: ['Anki', 'BunPro', 'Wanikani']}]}
                                />

                                <FilterableLegend
                                    filterItems={[
                                        'total-points'
                                    ]}
                                    position={isMobile ? 'bottom' : 'right'}
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
