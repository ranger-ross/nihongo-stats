import { useEffect, useMemo, useState } from 'react';
import { ArgumentAxis, Chart, Legend, Tooltip, ValueAxis, } from '@devexpress/dx-react-chart-material-ui';
import { Card, CardContent, CircularProgress, GridLegacy, Typography } from "@mui/material";
import { ArgumentAxis as ArgumentAxisBase, ArgumentScale, EventTracker, LineSeries } from "@devexpress/dx-react-chart";
import { daysSinceDate, daysToMillis, millisToDays, truncDate } from "../../util/DateUtils";
import { getVisibleLabelIndices, scaleBand } from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import { BunProGrammarPointLookupMap, createGrammarPointsLookupMap } from "../service/BunProDataUtil";
import { BunProReview } from "../models/BunProReview";
import { BunProGrammarPoint } from "../models/BunProGrammarPoint";
import { useDeviceInfo } from "../../hooks/useDeviceInfo";

type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

const JLPTLevels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

class DataPoint {

    date: Date
    total: number = 0
    N5: number | undefined
    N4: number | undefined
    N3: number | undefined
    N2: number | undefined
    N1: number | undefined

    constructor(date: Date, previousDataPoint?: DataPoint) {
        if (!!previousDataPoint) {
            Object.assign(this, previousDataPoint)
        }
        this.date = truncDate(date);
    }

    addReview(level: JLPTLevel) {
        this.total += 1;
        const amount = this[level];
        if (amount) {
            this[level] = amount + 1;
        } else {
            this[level] = 1;
        }
    }

}

function aggregateReviewByDay(reviews: BunProReview[], grammarPoints: BunProGrammarPointLookupMap) {
    const orderedReviews = reviews
        .map(review => ({
            ...review,
            createdAt: review.createdAt
        }))
        .sort((a, b,) => a.createdAt.getTime() - b.createdAt.getTime());


    const days: DataPoint[] = [new DataPoint(orderedReviews[0].createdAt)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== truncDate(review.createdAt).getTime()) {
            days.push(new DataPoint(review.createdAt, lastDay));
            lastDay = days[days.length - 1];
        }
        const gp = grammarPoints[review.grammarPointId]
        lastDay.addReview(gp.level.replace('JLPT', 'N') as JLPTLevel);
    }

    return days;
}

function useData(reviews?: BunProReview[], grammarPoints?: BunProGrammarPoint[]) {
    if (!reviews || !grammarPoints)
        return [];
    const grammarPointsMap = createGrammarPointsLookupMap(grammarPoints);
    return aggregateReviewByDay(reviews, grammarPointsMap);
}

function useOptions(rawData?: DataPoint[]) {
    const options = [
        { value: 30, text: '1 Mon' },
        { value: 60, text: '2 Mon' },
        { value: 90, text: '3 Mon' },
        { value: 180, text: '6 Mon' },
        { value: 365, text: '1 Yr' }
    ];

    if (!!rawData && rawData.length > 0) {
        options.push({
            value: millisToDays(Date.now() - rawData[0].date.getTime()),
            text: 'All'
        });
    }

    return options
}

type BunProTotalGrammarPointsChartProps = {
    grammarPoints?: BunProGrammarPoint[]
    reviews?: BunProReview[]
};

function BunProTotalGrammarPointsChart({ reviews, grammarPoints }: BunProTotalGrammarPointsChartProps) {
    const rawData = useMemo(() => useData(reviews, grammarPoints), [reviews, grammarPoints]);
    const isLoading = !grammarPoints || !reviews;
    const [daysToLookBack, setDaysToLookBack] = useState(60);
    const { isMobile } = useDeviceInfo();
    const options = useOptions(rawData);

    useEffect(() => {
        if (!!rawData && rawData.length > 0) {
            setDaysToLookBack(daysSinceDate(rawData[0].date));
        }
    }, [rawData]);

    const chartData = useMemo(() => rawData?.filter(day => day.date.getTime() > Date.now() - (daysToMillis(daysToLookBack))), [rawData, daysToLookBack]);

    function ReviewToolTip({ targetItem }: Tooltip.ContentProps) {
        if (!chartData) {
            return <></>;
        }
        const dp = chartData[targetItem.point];
        const value = targetItem.series.toLowerCase() === 'total' ? dp.total : dp[targetItem.series as JLPTLevel];
        return (
            <>
                <p>{dp.date.toLocaleDateString()}</p>
                <p>{targetItem.series}: {(value)?.toLocaleString()}</p>
            </>
        );
    }

    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], isMobile ? 3 : 6);

    function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
        const date = new Date(props.text);
        if (!date || !chartData) {
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
        <Card style={{ margin: '15px' }}>
            <CardContent>

                <GridLegacy container>
                    <GridLegacy item xs={12} md={4} />
                    <GridLegacy item xs={12} md={4}>
                        <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                            Total Grammar Points
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
                    !!chartData && chartData.length > 0 ? (
                        <Chart data={chartData}>
                            <ArgumentScale factory={scaleBand} />
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false} />
                            <ValueAxis />


                            {JLPTLevels.map(level => (
                                <LineSeries
                                    key={level}
                                    name={level}
                                    valueField={level}
                                    argumentField="date" />
                            ))}

                            <LineSeries
                                name="Total"
                                valueField="total"
                                argumentField="date" />

                            <Legend position={isMobile ? 'bottom' : 'right'} />
                            <EventTracker />
                            <Tooltip contentComponent={ReviewToolTip} />
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default BunProTotalGrammarPointsChart;
