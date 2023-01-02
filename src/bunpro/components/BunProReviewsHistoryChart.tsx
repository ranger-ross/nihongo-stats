import {useMemo, useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, MenuItem, Select, Typography} from "@mui/material";
import {
    ArgumentAxis as ArgumentAxisBase,
    ArgumentScale,
    BarSeries,
    EventTracker,
    Stack
} from "@devexpress/dx-react-chart";
import {daysToMillis, getMonthName, millisToDays, truncDate, truncMonth, truncWeek} from "../../util/DateUtils";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import {BunProFlattenedReviewWithLevel, flattenBunProReviews} from "../service/BunProDataUtil";
import ToolTipLabel from "../../shared/ToolTipLabel";
import {BunProReview} from "../models/BunProReview";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import {useDeviceInfo} from "../../hooks/useDeviceInfo";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

type JlptLevelType = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type ReviewUnit = {
    key: string,
    text: string,
    trunc: (date: Date | number) => Date,
};


const units: { [key: string]: ReviewUnit } = {
    days: {
        key: 'days',
        text: 'Days',
        trunc: truncDate
    },
    weeks: {
        key: 'weeks',
        text: 'Weeks',
        trunc: truncWeek
    },
    months: {
        key: 'months',
        text: 'Months',
        trunc: truncMonth
    },
};

type UnitSelectorProps = {
    options: { key: string, text: string }[],
    unit: ReviewUnit,
    onChange: (unit: ReviewUnit) => void
};

function UnitSelector({options, unit, onChange}: UnitSelectorProps) {
    return (
        <Select
            style={{minWidth: '130px'}}
            size={'small'}
            value={unit.key}
            onChange={e => onChange(options.find(o => o.key === e.target.value) as ReviewUnit)}
        >
            {options.map((option) => (
                <MenuItem key={option.key}
                          value={option.key}
                >
                    {option.text}
                </MenuItem>
            ))}
        </Select>
    );
}

class DataPoint {

    reviews: BunProFlattenedReviewWithLevel[] = [];
    total: number = 0;
    N5: number = 0;
    N4: number = 0;
    N3: number = 0;
    N2: number = 0;
    N1: number = 0;

    constructor(public date: Date) {
    }

    addReview(review: BunProFlattenedReviewWithLevel) {
        this.reviews.push(review);
        this.total = this.reviews.length;

        const level = review.level as JlptLevelType;
        this[level] += 1;
    }

}

function aggregateReviewByUnit(reviews: BunProFlattenedReviewWithLevel[], unit: ReviewUnit) {
    const orderedReviews = reviews.sort((a, b,) => a.current.time.getTime() - b.current.time.getTime());

    const days = [new DataPoint(unit.trunc(orderedReviews[0].current.time))];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() !== unit.trunc(review.current.time).getTime()) {
            days.push(new DataPoint(unit.trunc(review.current.time)));
            lastDay = days[days.length - 1];
        }
        lastDay.addReview(review);
    }
    return days;
}

function useOptions(rawData?: BunProFlattenedReviewWithLevel[]) {
    const options = [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},
        {value: 365, text: '1 Yr'},
    ];

    if (!!rawData && rawData.length > 0) {
        options.push({
            value: millisToDays(Date.now() - rawData[0].createdAt.getTime()),
            text: 'All'
        });
    }

    return options;
}

type BunProReviewsHistoryChartProps = {
    reviews?: BunProReview[]
    grammarPoints?: BunProGrammarPoint[]
};

function BunProReviewsHistoryChart({reviews, grammarPoints}: BunProReviewsHistoryChartProps) {
    const rawData = flattenBunProReviews(grammarPoints, reviews);
    const isLoading = !grammarPoints || !reviews;
    const [unit, setUnit] = useState(units.days);
    const [daysToLookBack, setDaysToLookBack] = useState(60);
    const {isMobile} = useDeviceInfo();
    const options = useOptions(rawData);


    const aggregatedDate = useMemo(() => rawData ? aggregateReviewByUnit(rawData, unit) : [], [rawData, unit.key])
    const chartData = useMemo(() => aggregatedDate?.filter(day => day.date.getTime() > Date.now() - (daysToMillis(daysToLookBack))), [aggregatedDate, daysToLookBack]);

    const ReviewToolTip = useMemo(() => {
        function getDateLabelText(date: Date) {
            if (unit.key === units.days.key)
                return date.toLocaleDateString()
            else if (unit.key === units.weeks.key)
                return date.toLocaleDateString()
            else if (unit.key === units.months.key)
                return `${getMonthName(date, true)} ${date.getFullYear()}`
        }

        return function ReviewToolTip({targetItem}: Tooltip.ContentProps) {
            const dp = chartData[targetItem.point];
            return (
                <>
                    <ToolTipLabel title="Date" value={getDateLabelText(dp.date)}/>
                    <br/>
                    <ToolTipLabel title="Total" value={(dp.total).toLocaleString()}/>
                    {JLPTLevels.map(level => (
                        dp[level as JlptLevelType] ?
                            <ToolTipLabel key={level} title={level} value={dp[level as JlptLevelType]}/> : null
                    ))}
                </>
            );
        }
    }, [chartData, unit.key])

    const LabelWithDate = useMemo(() => {
        const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], isMobile ? 3 : 6);
        return function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
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
    }, [chartData]);

    return (
        <Card style={{margin: '15px'}}>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}>
                        <UnitSelector
                            options={[
                                units.days,
                                units.weeks,
                                units.months
                            ]}
                            unit={unit}
                            onChange={setUnit}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            Reviews
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                        <PeriodSelector period={daysToLookBack}
                                        setPeriod={setDaysToLookBack}
                                        options={options}
                        />
                    </Grid>
                </Grid>

                {isLoading ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    !!chartData ? (
                        <Chart data={chartData}>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false}/>
                            <ValueAxis/>

                            {JLPTLevels.map(level => (
                                <BarSeries
                                    key={level}
                                    name={level}
                                    valueField={level}
                                    argumentField="date"/>
                            ))}

                            <Stack
                                stacks={[{series: JLPTLevels}]}
                            />

                            <Legend position={isMobile ? 'bottom' : 'right'}/>
                            <EventTracker/>
                            <Tooltip contentComponent={ReviewToolTip}/>
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default BunProReviewsHistoryChart;
