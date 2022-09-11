import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import React, {useEffect, useMemo, useState} from "react";
import {
    ArgumentAxis as ArgumentAxisBase,
    ArgumentScale,
    BarSeries,
    EventTracker,
    SeriesRef,
    Stack
} from "@devexpress/dx-react-chart";
import {AnkiColors, AppNames, BunProColors, WanikaniColors} from '../../Constants';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {getVisibleLabelIndices} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService";
import {daysToMillis, truncDate} from "../../util/DateUtils";
import AnkiApiService from "../../anki/service/AnkiApiService";
import {useAnkiDecks} from "../../hooks/useAnkiDecks";
import {fetchAllBunProReviews, BunProFlattenedReviewWithLevel} from "../../bunpro/service/BunProDataUtil";
import {useAnkiConnection} from "../../hooks/useAnkiConnection";
import {createSubjectMap} from "../../wanikani/service/WanikaniDataUtil";
import {AnkiReview} from "../../anki/models/AnkiReview";
import { scaleBand } from '../../util/ChartUtils';
import {WanikaniSubject} from "../../wanikani/models/WanikaniSubject";
import {WanikaniReview} from "../../wanikani/models/WanikaniReview";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey";
import {useBunProApiKey} from "../../hooks/useBunProApiKey";

type DataPoint = {
    date: Date,
    ankiData: any[],
    anki: number,
    bunProData: any[],
    bunPro: number,
    wanikaniData: any[],
    wanikani: number,
    addAnki: (d: any) => void,
    addBunPro: (d: any) => void,
    addWanikani: (d: any) => void,
};

function dataPoint(date: Date): DataPoint {
    const data: DataPoint = {
        date: date,
        ankiData: [],
        anki: 0,
        bunProData: [],
        bunPro: 0,
        wanikaniData: [],
        wanikani: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        addAnki: (d: any) => null,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        addBunPro: (d: any) => null,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        addWanikani: (d: any) => null,
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

type WKData = {
    date: Date,
    review: WanikaniReview,
    subject: WanikaniSubject
};

async function fetchWanikaniData(): Promise<WKData[]> {
    const reviews = await WanikaniApiService.getReviews();
    const subjects = createSubjectMap(await WanikaniApiService.getSubjects());
    const data: WKData[] = [];
    for (const review of reviews) {
        data.push({
            date: review.dataUpdatedAt,
            review: review,
            subject: subjects[review.subjectId]
        });
    }

    return data;
}

function addAppNameToReviewData(data: any[], appName: string) {
    return data.map(review => ({...review, appName}));
}

function aggregateDate(ankiReviews: any[], bunProReviews: any[], wanikaniReviews: any[], daysToLookBack: number) {
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

    const aggregatedDate = [dataPoint(truncDate(reviews[0].date))];
    for (const data of reviews) {
        if (aggregatedDate[aggregatedDate.length - 1].date.getTime() != truncDate(data.date).getTime()) {
            aggregatedDate.push(dataPoint(truncDate(data.date)));
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

type AnkiDateReview = AnkiReview & {
    date: Date
}

async function fetchAnkiReviews(ankiDecks: string[]): Promise<AnkiDateReview[]> {
    const reviewPromises: Promise<AnkiReview[]>[] = [];
    ankiDecks.forEach(name => reviewPromises.push(AnkiApiService.getAllReviewsByDeck(name)));
    const data = await Promise.all(reviewPromises)
    return data
        .reduce((a, c) => [...a, ...c], [])
        .map(review => ({
            ...review,
            date: new Date(review.reviewTime),
        }));
}

type BPData = BunProFlattenedReviewWithLevel & {
    date: Date
};

async function fetchBunProData(): Promise<BPData[]> {
    const reviews = await fetchAllBunProReviews();
    return reviews
        .map(review => ({...review, date: new Date(review.current.time)}))
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

    const {apiKey: wkApiKey} = useWanikaniApiKey();
    const {apiKey: bpApiKey} = useBunProApiKey();

    const [toolTipTargetItem, setToolTipTargetItem] = useState<SeriesRef>();
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const {decks: ankiDecks} = useAnkiDecks();

    const [ankiReviews, setAnkiReviews] = useState<AnkiDateReview[]>([]);
    const [bunProReviews, setBunProReviews] = useState<BPData[]>([]);
    const [wanikaniReviews, setWanikaniReviews] = useState<WKData[]>([]);

    const [isAnkiLoading, setIsAnkiLoading] = useState(false);
    const [isBunProLoading, setIsBunProLoading] = useState(false);
    const [isWanikaniLoading, setIsWanikaniLoading] = useState(false);

    const isLoading = isAnkiLoading || isWanikaniLoading || isBunProLoading;


    const chartData = useMemo(
        () => aggregateDate(ankiReviews, bunProReviews, wanikaniReviews, daysToLookBack),
        [wanikaniReviews, bunProReviews, ankiReviews, daysToLookBack]
    );


    useEffect(() => {
        if (!wkApiKey) {
            return;
        }
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
        return () => {
            isSubscribed = false;
        };
    }, []);


    useEffect(() => {
        if (!bpApiKey) {
            return;
        }
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
        return () => {
            isSubscribed = false;
        }
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
        return () => {
            isSubscribed = false;
        };
    }, [ankiDecks, isAnkiConnected]);

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

    function ReviewsToolTip({targetItem}: Tooltip.ContentProps) {
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
                                <PeriodSelector period={daysToLookBack}
                                                setPeriod={setDaysToLookBack}
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
                            {/*@ts-ignore*/}
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
