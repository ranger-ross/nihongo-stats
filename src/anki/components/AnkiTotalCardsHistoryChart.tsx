import { Card, CardContent, CircularProgress, GridLegacy, Typography } from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector";
import { daysToMillis, millisToDays, truncDate } from "../../util/DateUtils";
import { ArgumentAxis, Chart, Legend, Tooltip, ValueAxis } from "@devexpress/dx-react-chart-material-ui";
import { ArgumentAxis as ArgumentAxisBase, ArgumentScale, EventTracker, LineSeries } from "@devexpress/dx-react-chart";
import { useEffect, useMemo, useRef, useState } from "react";
import { getVisibleLabelIndices, scaleBand } from "../../util/ChartUtils";
import { DeckReviews } from "../service/AnkiDataUtil";
import { useAnkiReviewsByDeck } from "../service/AnkiQueries";
import { AnkiReview } from "../models/AnkiReview";

class DataPoint {
    date: Date
    totalCount: number
    cards: { [deck: string]: AnkiReview[] } = {}
    chartData: { [series: string]: number } = {}

    constructor(date: number, private previousDataPoint?: DataPoint) {
        this.date = truncDate(date)
        this.totalCount = previousDataPoint?.totalCount ?? 0

        if (!!previousDataPoint) {
            const totalKeys = Object.keys(previousDataPoint.chartData).filter(key => key.includes('total_'));
            for (const key of totalKeys) {
                this.chartData[key] = previousDataPoint.chartData[key] ?? 0;
            }
        }

    }

    addCard(deck: string, review: AnkiReview) {
        if (!this.cards[deck]) {
            this.cards[deck] = [review];
        } else {
            this.cards[deck].push(review);
        }

        if (!!this.previousDataPoint && !this.previousDataPoint.chartData[`total_${deck}`]) {
            this.previousDataPoint.chartData[`count_${deck}`] = 0;
            this.previousDataPoint.chartData[`total_${deck}`] = 0;
        }

        this.chartData[`count_${deck}`] = this.cards[deck].length;
        this.chartData[`total_${deck}`] = (this.chartData[`total_${deck}`] ?? 0) + 1;
        this.totalCount = (this.previousDataPoint?.totalCount ?? 0) + Object.keys(this.chartData)
            .filter(key => key.includes('count_'))
            .map(key => key.replace('count_', ''))
            .map(x => this.cards[x])
            .reduce((a, c) => a + c.length, 0);
    }


}

function formatMultiDeckReviewData(decks: DeckReviews[]): DataPoint[] {
    const reviews = [];
    for (const deck of decks) {
        reviews.push(...deck.reviews.map(r => ({
            ...r,
            deckName: deck.deckName
        })));
    }

    const orderedReviews = reviews.sort((a, b,) => a.reviewTime - b.reviewTime);
    const dayBeforeStartPoint = new DataPoint(orderedReviews[0].reviewTime - daysToMillis(1))
    const days = [dayBeforeStartPoint, new DataPoint(orderedReviews[0].reviewTime, dayBeforeStartPoint)];

    const cards: { [cardId: number]: boolean } = {};
    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.reviewTime).getTime()) {
            days.push(new DataPoint(review.reviewTime, lastDay));
            lastDay = days[days.length - 1];
        }

        if (cards[review.cardId]) {
            continue;
        }
        cards[review.cardId] = true;
        lastDay.addCard(review.deckName, review);
    }

    return days;
}

function useOptions(cardData?: DataPoint[]) {
    const options = [
        { value: 30, text: '1 Mon' },
        { value: 60, text: '2 Mon' },
        { value: 90, text: '3 Mon' },
        { value: 180, text: '6 Mon' },
        { value: 365, text: '1 Yr' },
    ];

    if (!!cardData) {
        options.push({
            value: millisToDays(Date.now() - cardData[0].date.getTime()),
            text: 'All'
        });
    }

    return options;
}

type AnkiTotalCardsHistoryChartProps = {
    deckNames: string[]
};

function AnkiTotalCardsHistoryChart({ deckNames }: AnkiTotalCardsHistoryChartProps) {
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const isFirstLoad = useRef(true);
    const { data, error, isLoading } = useAnkiReviewsByDeck(deckNames);
    const cardData = data ? formatMultiDeckReviewData(data) : undefined;

    const options = useOptions(cardData);

    error && console.error(error);

    useEffect(() => {
        if (isFirstLoad.current && cardData && cardData.length > 0) {
            setDaysToLookBack(millisToDays(Date.now() - cardData[0].date.getTime()))
            isFirstLoad.current = false;
        }
    }, [data]);

    const chartData = useMemo(() => (cardData ?? [])
        .filter(dp => dp.date.getTime() >= Date.now() - daysToMillis(daysToLookBack)),
        [cardData, daysToLookBack]);
    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 6);

    function CardToolTip({ text, targetItem }: Tooltip.ContentProps) {
        return (
            <>
                <p>{targetItem.series !== 'Total' ? 'Deck:' : null} {targetItem.series}</p>
                <p>Cards: {(parseInt(text)).toLocaleString()}</p>
            </>
        );
    }

    function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
        const date = new Date(props.text);
        if (!date) {
            return (<></>)
        }

        const index = chartData.findIndex(dp => dp.date.getTime() === date.getTime());
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

                <GridLegacy container>
                    <GridLegacy item xs={12} md={4} />
                    <GridLegacy item xs={12} md={4}>
                        <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                            Total Cards
                        </Typography>
                    </GridLegacy>
                    <GridLegacy item xs={12} md={4} style={{ textAlign: 'end' }}>
                        <PeriodSelector period={daysToLookBack}
                            setPeriod={setDaysToLookBack}
                            options={options}
                        />
                    </GridLegacy>
                </GridLegacy>

                {isLoading ? (
                    <div style={{ height: '300px', textAlign: 'center' }}>
                        <CircularProgress style={{ margin: '100px' }} />
                    </div>
                ) : (
                    chartData ? (
                        <Chart data={chartData.map(d => ({
                            ...d,
                            ...d.chartData
                        }))}>
                            <ArgumentScale factory={scaleBand} />
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false} />
                            <ValueAxis />

                            <LineSeries name="Total"
                                valueField="totalCount"
                                argumentField="date"
                            />

                            {deckNames.map((name, idx) => (
                                <LineSeries key={idx}
                                    name={name}
                                    valueField={`total_${name}`}
                                    argumentField="date"
                                />
                            ))}

                            <Legend />
                            <EventTracker />
                            <Tooltip contentComponent={CardToolTip} />
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default AnkiTotalCardsHistoryChart;
