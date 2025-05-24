import { ArgumentAxis, Chart, Legend, Tooltip, ValueAxis } from '@devexpress/dx-react-chart-material-ui';
import React, { useMemo, useState } from "react";
import {
    ArgumentAxis as ArgumentAxisBase,
    ArgumentScale,
    BarSeries,
    EventTracker,
    SeriesRef,
    Stack
} from "@devexpress/dx-react-chart";
import { ANKI_COLORS, APP_NAMES, BUNPRO_COLORS, WANIKANI_COLORS } from '../../Constants';
import { Card, CardContent, CircularProgress, GridLegacy, Typography } from "@mui/material";
import { getVisibleLabelIndices, scaleBand } from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import { daysToMillis, truncDate } from "../../util/DateUtils";
import { useAnkiDecks } from "../../hooks/useAnkiDecks";
import { BunProFlattenedReviewWithLevel, flattenBunProReviews } from "../../bunpro/service/BunProDataUtil";
import { useAnkiConnection } from "../../hooks/useAnkiConnection";
import { createSubjectMap } from "../../wanikani/service/WanikaniDataUtil";
import { AnkiReview } from "../../anki/models/AnkiReview";
import { WanikaniSubject } from "../../wanikani/models/WanikaniSubject";
import { WanikaniReview } from "../../wanikani/models/WanikaniReview";
import { useWanikaniApiKey } from "../../hooks/useWanikaniApiKey";
import { useBunProApiKey } from "../../hooks/useBunProApiKey";
import { useAnkiReviewsByDeck } from "../../anki/service/AnkiQueries";
import { DeckReviews } from "../../anki/service/AnkiDataUtil";
import { useWanikaniData } from "../../hooks/useWanikaniData";
import { useBunProData } from "../../hooks/useBunProData";
import { BunProReview } from "../../bunpro/models/BunProReview";
import { BunProGrammarPoint } from "../../bunpro/models/BunProGrammarPoint";
import { useDeviceInfo } from "../../hooks/useDeviceInfo";

class DataPoint {

    ankiData: any[] = [];
    anki: number = 0;
    bunProData: any[] = [];
    bunPro: number = 0;
    wanikaniData: any[] = [];
    wanikani: number = 0;

    constructor(public date: Date) {
    }

    addAnki(d: any) {
        this.ankiData.push(d);
        this.anki = this.ankiData.length;
    }

    addBunPro(d: any) {
        this.bunProData.push(d);
        this.bunPro = this.bunProData.length;
    }

    addWanikani(d: any) {
        this.wanikaniData.push(d);
        this.wanikani = this.wanikaniData.length;
    }
}

type WKData = {
    date: Date,
    review: WanikaniReview,
    subject: WanikaniSubject
};

function formatWanikaniData(reviews: WanikaniReview[], subjects: WanikaniSubject[]): WKData[] {
    const subjectsMap = createSubjectMap(subjects);
    const data: WKData[] = [];
    for (const review of reviews) {
        data.push({
            date: review.dataUpdatedAt,
            review: review,
            subject: subjectsMap[review.subjectId]
        });
    }

    return data;
}

function addAppNameToReviewData(data: any[], appName: string) {
    return data.map(review => ({ ...review, appName }));
}

function aggregateDate(ankiReviews: any[], bunProReviews: any[], wanikaniReviews: any[], daysToLookBack: number) {
    const reviews = [
        ...(bunProReviews ? addAppNameToReviewData(bunProReviews, APP_NAMES.bunpro) : []),
        ...(ankiReviews ? addAppNameToReviewData(ankiReviews, APP_NAMES.anki) : []),
        ...(wanikaniReviews ? addAppNameToReviewData(wanikaniReviews, APP_NAMES.wanikani) : []),
    ]
        .filter(review => review.date > truncDate(Date.now() - daysToMillis(daysToLookBack)))
        .sort((a, b) => a.date.getTime() - b.date.getTime());


    if (reviews.length == 0) {
        return [];
    }

    const aggregatedDate = [new DataPoint(truncDate(reviews[0].date))];
    for (const data of reviews) {
        if (aggregatedDate[aggregatedDate.length - 1].date.getTime() != truncDate(data.date).getTime()) {
            aggregatedDate.push(new DataPoint(truncDate(data.date)));
        }

        const lastDay = aggregatedDate[aggregatedDate.length - 1];

        if (data.appName === APP_NAMES.wanikani) {
            lastDay.addWanikani(data);
        } else if (data.appName === APP_NAMES.anki) {
            lastDay.addAnki(data);
        } else if (data.appName === APP_NAMES.bunpro) {
            lastDay.addBunPro(data);
        }
    }

    return aggregatedDate;
}

type AnkiDateReview = AnkiReview & {
    date: Date
}

function formatAnkiData(reviews: DeckReviews[]): AnkiDateReview[] {
    const data = reviews
        .map(x => x.reviews)
        .reduce((a, c) => [...a, ...c], []);

    return data
        .map(review => ({
            ...review,
            date: new Date(review.reviewTime),
        }));
}

type BPData = BunProFlattenedReviewWithLevel & {
    date: Date
};

function formatBunProData(grammarPoints?: BunProGrammarPoint[], reviews?: BunProReview[]): BPData[] {
    const data = flattenBunProReviews(grammarPoints, reviews) ?? [];
    return data
        .map(review => ({ ...review, date: new Date(review.current.time) }))
        .sort((a, b,) => a.date.getTime() - b.date.getTime());
}

function calculateLabelPositions(data: any[]) {
    const numberOfLabels = data.length == 7 ? 7 : 6
    return getVisibleLabelIndices(data, numberOfLabels);
}

function OverviewReviewsHistoryChart() {
    const ankiSeriesName = 'Anki';
    const bunProSeriesName = 'BunPro';
    const wanikaniSeriesName = 'Wanikani';

    const isAnkiConnected = useAnkiConnection();

    const { apiKey: wkApiKey } = useWanikaniApiKey();
    const { apiKey: bpApiKey } = useBunProApiKey();

    const { isMobile } = useDeviceInfo();
    const [toolTipTargetItem, setToolTipTargetItem] = useState<SeriesRef>();
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const { decks: ankiDecks } = useAnkiDecks();

    // Anki
    const { data: ankiRawData, isLoading: isAnkiLoading, error: ankiError } = useAnkiReviewsByDeck(ankiDecks);
    ankiError && console.error(ankiError);
    const ankiReviews = ankiRawData ? formatAnkiData(ankiRawData) : [];

    const { grammarPoints, reviewData, isLoading: isBunProLoading } = useBunProData({
        grammarPoints: !!bpApiKey,
        reviews: !!bpApiKey,
    })
    const bunProReviews = formatBunProData(grammarPoints, reviewData?.reviews);

    // Wanikani
    const { reviews, subjects, isLoading: isWanikaniFetching } = useWanikaniData({
        reviews: !!wkApiKey,
        subjects: !!wkApiKey,
    });
    const wanikaniReviews = formatWanikaniData(reviews, subjects);


    const isLoading = (isAnkiLoading && isAnkiConnected) || isWanikaniFetching || isBunProLoading;

    const chartData = useMemo(
        () => aggregateDate(ankiReviews, bunProReviews, wanikaniReviews, daysToLookBack),
        [wanikaniReviews, bunProReviews, ankiReviews, daysToLookBack]
    );

    const showAnkiSeries = isAnkiConnected && !!ankiReviews && ankiReviews.length > 0;
    const showBunProSeries = !!bunProReviews && bunProReviews.length > 0;
    const showWanikaniSeries = !!wanikaniReviews && wanikaniReviews.length > 0;

    function onTooltipChange(target: SeriesRef) {
        let newTarget = target;
        if (target?.point) {
            if (showWanikaniSeries && chartData[target.point].wanikani > 0) {
                newTarget = {
                    ...target,
                    series: wanikaniSeriesName
                }
            } else if (showBunProSeries && chartData[target.point].bunPro > 0) {
                newTarget = {
                    ...target,
                    series: bunProSeriesName
                }
            } else if (showAnkiSeries && chartData[target.point].anki > 0) {
                newTarget = {
                    ...target,
                    series: ankiSeriesName
                }
            }
        }
        setToolTipTargetItem(newTarget);
    }

    function ReviewsToolTip({ targetItem }: Tooltip.ContentProps) {
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

    function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
        const date = props.text;
        if (!date) {
            return (<></>);
        }

        const index = chartData.findIndex(d => new Date(d.date).getTime() === new Date(date).getTime());

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
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <GridLegacy container>
                        <GridLegacy item xs={12} md={4} />
                        <GridLegacy item xs={12} md={4}>
                            <Typography variant={'h5'} style={{ textAlign: 'center', paddingBottom: '5px' }}>
                                Review History
                            </Typography>
                        </GridLegacy>


                        {isLoading ? (
                            <GridLegacy item container xs={12} justifyContent={'center'} style={{ padding: '10px' }}>
                                <CircularProgress />
                            </GridLegacy>
                        ) : (
                            <GridLegacy item xs={12} md={4} style={{ textAlign: 'end' }}>
                                <PeriodSelector period={daysToLookBack}
                                    setPeriod={setDaysToLookBack}
                                    options={[
                                        { value: 7, text: '7' },
                                        { value: 14, text: '14' },
                                        { value: 30, text: '30' },
                                        { value: 90, text: '3 Mon' },
                                        { value: 180, text: '6 Mon' },
                                        { value: 365, text: '1 Yr' },
                                        { value: 10_000, text: 'All' },
                                    ]}
                                />
                            </GridLegacy>
                        )}
                    </GridLegacy>

                    {!isLoading && !!chartData ? (
                        <div style={{ flexGrow: '1' }}>
                            <Chart data={chartData}>
                                <ArgumentScale factory={scaleBand} />
                                <ArgumentAxis labelComponent={LabelWithDate} />
                                <ValueAxis />

                                {showAnkiSeries ? (
                                    <BarSeries
                                        name="Anki"
                                        valueField="anki"
                                        argumentField="date"
                                        color={ANKI_COLORS.lightGreen}
                                    />
                                ) : null}

                                {showBunProSeries ? (
                                    <BarSeries
                                        name="BunPro"
                                        valueField="bunPro"
                                        argumentField="date"
                                        color={BUNPRO_COLORS.blue}
                                    />
                                ) : null}

                                {showWanikaniSeries ? (
                                    <BarSeries
                                        name="Wanikani"
                                        valueField="wanikani"
                                        argumentField="date"
                                        color={WANIKANI_COLORS.pink}
                                    />
                                ) : null}

                                <Stack
                                    stacks={[{ series: ['Anki', "BunPro", 'Wanikani'] }]}
                                />

                                <Legend position={isMobile ? 'bottom' : 'right'} />
                                <EventTracker />
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
