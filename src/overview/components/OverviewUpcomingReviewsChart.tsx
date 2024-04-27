import React, {useMemo, useState} from "react";
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {addDays, addHours, daysToMillis, truncDate, truncMinutes} from '../../util/DateUtils';
import PeriodSelector from "../../shared/PeriodSelector";
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
import {createAnkiCardsDueQuery} from "../../anki/service/AnkiDataUtil";
import {ANKI_COLORS, APP_NAMES, BUNPRO_COLORS, WANIKANI_COLORS} from "../../Constants";
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
import {scaleBand} from "../../util/ChartUtils";
import {AnkiReview} from "../../anki/models/AnkiReview";
import {WanikaniAssignment} from "../../wanikani/models/WanikaniAssignment";
import {BunProReview} from "../../bunpro/models/BunProReview";
import {useWanikaniData} from "../../hooks/useWanikaniData";
import {getPendingLessonsAndReviews} from "../../wanikani/service/WanikaniDataUtil";
import {useBunProData} from "../../hooks/useBunProData";
import {BunProReviewsResponse} from "../../bunpro/models/BunProReviewsResponse";
import {useAnkiDeckSummaries} from "../../anki/service/AnkiQueries";
import {useQuery} from "@tanstack/react-query";

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

class DataPoint {
    date: number
    bunProCount: number = 0
    wanikaniCount: number = 0
    ankiCount: number = 0
    total: number = 0

    constructor(date: Date, unit: UpcomingReviewUnit, reviews: any[], previousDataPoint?: DataPoint) {
        this.date = unit.trunc(date).getTime();
        this.total = reviews.length

        if (previousDataPoint) {
            this.total += previousDataPoint.total;
        }


        for (const review of reviews) {
            this.addReview(review.appName);
        }

    }

    addReview(appName: string) {
        if (appName === APP_NAMES.anki)
            this.ankiCount += 1;
        else if (appName === APP_NAMES.bunpro)
            this.bunProCount += 1;
        else if (appName === APP_NAMES.wanikani)
            this.wanikaniCount += 1;
    }

}

type BunProDateReview = BunProReview & {
    date: Date
}

function getBunProReviews(reviewData: BunProReviewsResponse): BunProDateReview[] {
    return [...reviewData.reviews, ...reviewData.ghostReviews]
        .filter(filterDeadGhostReviews)
        .map(review => ({...review, date: review.nextReview as Date}));
}

type AnkiDateReview = { date: Date, review: AnkiReview }

async function getAnkiReviews(decks: string[]) {
    const actions = [];
    for (let i = 0; i < maxDaysIntoFuture; i++) { // <== Use 31 days since it is more that the max,
        for (const deck of decks) {               //     we don't want to constantly reload this when user changes period
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
        ...(bunProReviews ? addAppNameToReviewData(bunProReviews, APP_NAMES.bunpro) : []),
        ...(ankiReviews ? addAppNameToReviewData(ankiReviews, APP_NAMES.anki) : []),
        ...(wanikaniReviews ? addAppNameToReviewData(wanikaniReviews, APP_NAMES.wanikani) : []),
    ]
        .filter(review => review.date >= unit.trunc(Date.now()) && review.date < unit.trunc(Date.now() + daysToMillis(maxDaysIntoFuture)))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const data: DataPoint[] = [];
    for (let i = 0; i < period; i++) {
        const time = addTimeToDate(getChartStartTime(), unit, i);
        const reviewsInPeriod = reviews.filter(review => unit.isPeriodTheSame(unit.trunc(review.date), time));
        const dp = new DataPoint(time, unit, reviewsInPeriod, data[i - 1]);

        if (data.length === 0)
            dp.total += (ankiInitialReviewCount + bunProInitialReviewCount + wanikaniInitialReviewCount);

        data.push(dp);
    }
    return data;
}

type WanikaniDateReview = WanikaniAssignment & { date: Date }


function getWanikaniReviews(assignments: WanikaniAssignment[]): WanikaniDateReview[] {
    return assignments.filter(assignment => !assignment.burnedAt || !assignment.availableAt)
        .filter(assignment => !!assignment.availableAt && assignment.availableAt > addDays(new Date(), -1))
        .map(assignment => ({...assignment, date: assignment.availableAt as Date}));
}

function useWanikaniReviews(wanikaniApiKey: string | null) {
    const {assignments, summary, isLoading} = useWanikaniData({
        assignments: !!wanikaniApiKey,
        summary: !!wanikaniApiKey,
    });

    const initialReviewCount = summary ? getPendingLessonsAndReviews(summary).reviews : 0;
    const wanikaniReviews = assignments && assignments.length > 0 ? getWanikaniReviews(assignments) : null;
    return {wanikaniReviews, initialReviewCount, isWanikaniLoading: isLoading};
}

function useBunProReviews(bunProApiKey?: string | null) {
    const {pendingReviewsCount, reviewData, isLoading} = useBunProData({
        pendingReviews: !!bunProApiKey
    })

    const bunProReviews = reviewData ? getBunProReviews(reviewData) : null;
    const initialReviewCount = pendingReviewsCount ?? 0

    return {bunProReviews, initialReviewCount, isBunProLoading: isLoading};
}

function useAnkiReviews(isAnkiConnected: boolean) {
    const {selectedDecks: ankiSelectedDecks} = useSelectedAnkiDecks();

    const {data: ankiReviews, error: error1, isLoading: isReviewsLoading} =
        useQuery({
            queryKey: ['overviewAnkiUpcomingReviews'], 
            queryFn: () => getAnkiReviews(ankiSelectedDecks), 
            enabled: isAnkiConnected
        })
    error1 && console.error(error1);

    const {
        data: deckSummaries,
        error: error2,
        isLoading: isDeckSummariesLoading
    } = useAnkiDeckSummaries(ankiSelectedDecks);
    error2 && console.error(error2);
    const initialReviewCount = deckSummaries?.map(deck => deck.dueCards).reduce((a, c) => a + c) ?? 0;

    const isLoading = isReviewsLoading || isDeckSummariesLoading;

    return {ankiReviews, initialReviewCount, isAnkiLoading: isLoading};
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

    const {
        ankiReviews,
        initialReviewCount: ankiInitialReviewCount,
        isAnkiLoading
    } = useAnkiReviews(isAnkiConnected);
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

    const isLoading = (isAnkiLoading && isAnkiConnected) || isWanikaniLoading || isBunProLoading;
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

        let newTarget = target;

        if (target) {
            if (!target.series.toLowerCase().includes('total')) {
                newTarget = {
                    ...target,
                    series: getTopSeries(target, chartData)
                }
            }
            if (target.series.toLowerCase() == 'total-points') {
                newTarget = {
                    ...target,
                    series: 'Total'
                }
            }
        }
        setToolTipTargetItem(newTarget);
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
                                        color={ANKI_COLORS.lightGreen}
                                        pointComponent={BarWithLabel}
                                    />
                                ) : null}

                                {showBunProSeries ? (
                                    <BarSeries
                                        name={bunProSeriesName}
                                        valueField="bunProCount"
                                        argumentField="date"
                                        scaleName="daily"
                                        color={BUNPRO_COLORS.blue}
                                        pointComponent={BarWithLabel}
                                    />
                                ) : null}

                                {showWanikaniSeries ? (
                                    <BarSeries
                                        name={wanikaniSeriesName}
                                        valueField="wanikaniCount"
                                        argumentField="date"
                                        scaleName="daily"
                                        color={WANIKANI_COLORS.pink}
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
