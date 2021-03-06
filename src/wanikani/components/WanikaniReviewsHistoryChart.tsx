import {ArgumentAxis, Chart, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import React, {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import {
    ArgumentScale,
    BarSeries,
    EventTracker,
    SeriesRef,
    Stack,
    Tooltip as TooltipBase,
    ValueAxis as ValueAxisBase,
} from "@devexpress/dx-react-chart";
import {WanikaniColors} from '../../Constants';
import {Card, CardContent, CircularProgress, Grid, MenuItem, Select, Typography} from "@mui/material";
import {getVisibleLabelIndices} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import {addDays, getMonthName, millisToDays, truncDate, truncMonth, truncWeek} from "../../util/DateUtils";
import {createSubjectMap} from "../service/WanikaniDataUtil";
import ToolTipLabel from "../../shared/ToolTipLabel";
import {RawWanikaniReview} from "../models/raw/RawWanikaniReview";
import {RawWanikaniSubject} from "../models/raw/RawWanikaniSubject";
import { scaleBand } from '../../util/ChartUtils';

type PeriodUnit = {
    key: string,
    text: string,
    trunc: (date: Date | number) => Date,
};

const units: { [key: string]: PeriodUnit } = {
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

type WkReviewSubject = {
    review: RawWanikaniReview,
    subject: RawWanikaniSubject,
};

type DataPoint = {
    date: Date,
    data: any[],
    total: number,
    radicals: number,
    kanji: number,
    vocabulary: number,
    push: (d: any) => void,
};

function dataPoint(date: Date) {
    const data: DataPoint = {
        date: date,
        data: [],
        total: 0,
        radicals: 0,
        kanji: 0,
        vocabulary: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        push: (_: any) => null,
    };

    data.push = (d) => {
        data.data.push(d);
        data.total = data.data.length;

        switch (d.subject?.object) {
            case 'radical':
                data.radicals += 1;
                break;
            case 'kanji':
                data.kanji += 1;
                break;
            case 'vocabulary':
                data.vocabulary += 1;
                break;
        }
    };

    return data;
}

async function fetchData() {
    const reviews = await WanikaniApiService.getReviews();
    const subjects = createSubjectMap(await WanikaniApiService.getSubjects());
    const data: WkReviewSubject[] = [];
    for (const review of reviews) {
        data.push({
            review: review,
            subject: subjects[review.data['subject_id']]
        });
    }

    return data;
}

function aggregateDate(rawData: WkReviewSubject[], daysToLookBack: number, unit: PeriodUnit): DataPoint[] {
    const areDatesDifferent = (date1: Date, date2: Date) => unit.trunc(date1).getTime() != unit.trunc(date2).getTime();
    const startDate = unit.trunc(Date.now() - (1000 * 60 * 60 * 24 * (daysToLookBack - 1))).getTime();
    const dataForTimeRange = rawData.filter(data => new Date(data.review.data['created_at']).getTime() > startDate);

    // Make sure to DataPoints for days with no reviews, so there is a gap in the graph
    function fillInEmptyDaysIfNeeded(aggregatedData: DataPoint[], reviewDate: Date) {
        const dayBeforeReview = addDays(truncDate(reviewDate), -1);
        let lastDataPoint = aggregatedData[aggregatedData.length - 1];
        while (lastDataPoint.date.getTime() < dayBeforeReview.getTime()) {
            aggregatedData.push(dataPoint(addDays(lastDataPoint.date, 1)));
            lastDataPoint = aggregatedData[aggregatedData.length - 1];
        }
    }

    const aggregatedData: DataPoint[] = [dataPoint(truncDate(new Date(dataForTimeRange[0].review.data['created_at'])))];
    for (const data of dataForTimeRange) {
        if (areDatesDifferent(aggregatedData[aggregatedData.length - 1].date, new Date(data.review.data['created_at']))) {
            fillInEmptyDaysIfNeeded(aggregatedData, new Date(data.review.data['created_at']));
            aggregatedData.push(dataPoint(unit.trunc(new Date(data.review.data['created_at']))));
        }

        aggregatedData[aggregatedData.length - 1].push(data);
    }

    return aggregatedData;
}

function getTotalDays() {
    const firstDate = truncDate(new Date(2000, 0, 1));
    const today = truncDate(Date.now());
    const difference = today.getTime() - firstDate.getTime();
    return millisToDays(difference);
}

function calculateLabelPositions(data: DataPoint[]) {
    const numberOfLabels = data.length == 7 ? 7 : 6
    return getVisibleLabelIndices(data, numberOfLabels);
}

type UnitSelectorProps = {
    options: PeriodUnit[],
    unit: PeriodUnit,
    onChange: (unit: PeriodUnit) => void,
};

function UnitSelector({options, unit, onChange}: UnitSelectorProps) {
    return (
        <Select
            style={{minWidth: '130px'}}
            size={'small'}
            value={unit.key}
            onChange={e => onChange(options.find(o => o.key === e.target.value) as PeriodUnit)}
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

const totalDays = getTotalDays();

function WanikaniReviewsHistoryChart() {
    const [rawData, setRawData] = useState<WkReviewSubject[]>([]);
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [tooltipTargetItem, setTooltipTargetItem] = useState<SeriesRef>();
    const [unit, setUnit] = useState(units.days);

    useEffect(() => {
        setIsLoading(true);
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
                setIsLoading(false);
            })
            .catch(console.error);
        return () => {
            isSubscribed = false;
        };
    }, []);

    const chartData: DataPoint[] = useMemo(() => rawData.length == 0 ? [] :
        aggregateDate(rawData, daysToLookBack, unit), [rawData, daysToLookBack, unit])

    const ReviewsToolTip = useMemo(() => {
        function getDateLabelText(date: Date): string {
            if (unit.key === units.days.key)
                return date.toLocaleDateString()
            else if (unit.key === units.weeks.key)
                return date.toLocaleDateString()
            else if (unit.key === units.months.key)
                return `${getMonthName(date, true)} ${date.getFullYear()}`
            return '';
        }

        return function ReviewsToolTip({targetItem}: TooltipBase.ContentProps) {
            const data = chartData[targetItem.point];
            return (
                <>
                    <ToolTipLabel title="Date" value={getDateLabelText(data.date)}/>
                    <br/>
                    <ToolTipLabel title="Total" value={data.total}/>
                    <ToolTipLabel title="Radicals" value={data.radicals}/>
                    <ToolTipLabel title="Kanji" value={data.kanji}/>
                    <ToolTipLabel title="Vocabulary" value={data.vocabulary}/>
                </>
            );
        }
    }, [chartData, unit]);


    const LabelWithDate = useMemo(() => {
        const visibleLabelIndices = calculateLabelPositions(chartData);

        return function LabelWithDate(props: ValueAxisBase.LabelProps) {
            const date = props.text;
            if (!date) {
                return (<></>);
            }

            const index = chartData.findIndex(d => new Date(d.date).getTime() === new Date(date).getTime());

            if (!visibleLabelIndices.includes(index)) {
                return (<></>);
            }

            return (
                <ArgumentAxis.Label
                    {...props}
                    text={new Date(date).toLocaleDateString()}
                />
            );
        }
    }, [chartData])

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
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
                                                    {value: totalDays, text: 'All'},
                                                ]}
                                />
                            </Grid>
                        )}
                    </Grid>

                    {!isLoading ? (
                        <div style={{flexGrow: '1'}}>
                            {/*@ts-ignore*/}
                            <Chart data={chartData}>
                                <ArgumentScale factory={scaleBand}/>
                                <ArgumentAxis labelComponent={LabelWithDate}/>
                                <ValueAxis/>

                                <BarSeries
                                    name="radicals"
                                    valueField="radicals"
                                    argumentField="date"
                                    color={WanikaniColors.blue}
                                />

                                <BarSeries
                                    name="kanji"
                                    valueField="kanji"
                                    argumentField="date"
                                    color={WanikaniColors.pink}
                                />

                                <BarSeries
                                    name="vocabulary"
                                    valueField="vocabulary"
                                    argumentField="date"
                                    color={WanikaniColors.purple}
                                />

                                <Stack
                                    stacks={[{series: ['radicals', 'kanji', 'vocabulary']}]}
                                />

                                <EventTracker/>
                                <Tooltip
                                    targetItem={tooltipTargetItem ? {
                                        ...tooltipTargetItem,
                                        series: 'vocabulary'
                                    } : undefined}
                                    onTargetItemChange={setTooltipTargetItem}
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

export default WanikaniReviewsHistoryChart;
