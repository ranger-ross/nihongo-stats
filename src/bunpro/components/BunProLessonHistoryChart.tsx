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
import {
    addDays,
    getMonthName,
    millisToDays,
    truncDate,
    truncMonth,
    truncWeek
} from "../../util/DateUtils";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import {createGrammarPointsLookupMap} from "../service/BunProDataUtil";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import ToolTipLabel from "../../shared/ToolTipLabel";
import {BunProReview} from "../models/BunProReview";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

type JlptLevelType = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

class DataPoint {

    data: BunProGrammarPoint[] = [];
    N5 = 0;
    N4 = 0;
    N3 = 0;
    N2 = 0;
    N1 = 0;

    constructor(public date: Date) {
    }

    push(grammarPoint: BunProGrammarPoint) {
        this.data.push(grammarPoint);

        switch (grammarPoint.level) {
            case 'JLPT1':
                this.N1 += 1;
                break;
            case 'JLPT2':
                this.N2 += 1;
                break;
            case 'JLPT3':
                this.N3 += 1;
                break;
            case 'JLPT4':
                this.N4 += 1;
                break;
            case 'JLPT5':
                this.N5 += 1;
                break;
        }
    }

    get total(): number {
        return this.data.length;
    }

}


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


function useOptions(rawData?: BunProReview[]) {
    const options = [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},
        {value: 365, text: '1 Yr'},
    ];

    if (!!rawData && rawData.length > 0) {
        options.push({
            value: millisToDays(Date.now() - rawData[rawData.length - 1].createdAt.getTime()),
            text: 'All'
        });
    }

    return options;
}

function aggregateDate(reviews: BunProReview[], grammarPoints: BunProGrammarPoint[], daysToLookBack: number, unit: ReviewUnit): DataPoint[] {
    const grammarPointMap = createGrammarPointsLookupMap(grammarPoints);
    const areDatesDifferent = (date1: Date, date2: Date) => unit.trunc(date1).getTime() != unit.trunc(date2).getTime();
    const startDate = unit.trunc(Date.now() - (1000 * 60 * 60 * 24 * (daysToLookBack - 1))).getTime();
    const dataForTimeRange = reviews.filter(data => data.createdAt.getTime() > startDate)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    function addPeriod(date: Date): Date {
        let temp = new Date(date);
        while (!areDatesDifferent(temp, date)) {
            temp = addDays(temp, 1);
        }
        return temp;
    }

    if (dataForTimeRange.length === 0) {
        return []; // No lessons for time range
    }

    // Make sure to add DataPoints for days/weeks/months with no lessons, so there is a gap in the graph
    function fillInEmptyPeriodsIfNeeded(aggregatedData: DataPoint[], lessonDate: Date) {
        const dayBeforeLesson = unit.trunc(unit.trunc(lessonDate).getTime() - 1);
        let lastDataPoint = aggregatedData[aggregatedData.length - 1];
        while (lastDataPoint.date.getTime() < dayBeforeLesson.getTime()) {
            aggregatedData.push(new DataPoint(addPeriod(lastDataPoint.date)));
            lastDataPoint = aggregatedData[aggregatedData.length - 1];
        }
    }

    // If user selects 'All' we need to set the first lesson date.
    const firstLessonDate = daysToLookBack > 365 ? unit.trunc(dataForTimeRange[0].createdAt) : new Date(startDate);

    const aggregatedData: DataPoint[] = [new DataPoint(firstLessonDate)];
    for (const data of dataForTimeRange) {
        if (areDatesDifferent(aggregatedData[aggregatedData.length - 1].date, data.createdAt)) {
            fillInEmptyPeriodsIfNeeded(aggregatedData, data.createdAt);
            aggregatedData.push(new DataPoint(unit.trunc(data.createdAt)));
        }
        const grammarPoint = grammarPointMap[data.grammarPointId];
        aggregatedData[aggregatedData.length - 1].push(grammarPoint);
    }

    // Fill in DataPoints if there are no lessons between last DataPoint and the current period
    const currentPeriod = unit.trunc(new Date());
    if (currentPeriod.getTime() !== aggregatedData[aggregatedData.length - 1].date.getTime()) {
        fillInEmptyPeriodsIfNeeded(aggregatedData, currentPeriod);
    }

    return aggregatedData;
}

type BunProLessonHistoryChartProps = {
    reviews?: BunProReview[]
    grammarPoints?: BunProGrammarPoint[]
};

function BunProLessonHistoryChart({reviews, grammarPoints}: BunProLessonHistoryChartProps) {
    const isLoading = !grammarPoints || !reviews;
    const [unit, setUnit] = useState(units.months);
    const [daysToLookBack, setDaysToLookBack] = useState(365);
    const {width} = useWindowDimensions();
    const isMobile = width < 400;
    const options = useOptions(reviews);

    const chartData = useMemo(
        () => reviews && grammarPoints ? aggregateDate(reviews, grammarPoints, daysToLookBack, unit) : [],
        [reviews, grammarPoints, daysToLookBack, unit.key]
    );

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
                            Lessons
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
                        // @ts-ignore
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

export default BunProLessonHistoryChart;
