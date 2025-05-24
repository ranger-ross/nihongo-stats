import { ArgumentAxis, Chart, Tooltip, ValueAxis } from '@devexpress/dx-react-chart-material-ui';
import React, { useMemo, useState } from "react";
import {
    ArgumentScale,
    BarSeries,
    EventTracker,
    SeriesRef,
    Stack,
    Tooltip as TooltipBase,
    ValueAxis as ValueAxisBase,
} from "@devexpress/dx-react-chart";
import { WANIKANI_COLORS } from '../../Constants';
import { Card, CardContent, CircularProgress, GridLegacy, MenuItem, Select, Typography } from "@mui/material";
import { getVisibleLabelIndices, scaleBand } from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import { addDays, getMonthName, millisToDays, truncDate, truncMonth, truncWeek } from "../../util/DateUtils";
import { createSubjectMap } from "../service/WanikaniDataUtil";
import ToolTipLabel from "../../shared/ToolTipLabel";
import { WanikaniSubjectAssignment } from "../models/WanikaniSubjectAssignment";
import { WanikaniSubject } from "../models/WanikaniSubject";
import { WanikaniAssignment } from "../models/WanikaniAssignment";
import { ErrorBoundary } from "react-error-boundary";
import { GenericErrorMessage } from "../../shared/GenericErrorMessage";
import { useDeviceInfo } from "../../hooks/useDeviceInfo";

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

class DataPoint {
    data: WanikaniSubjectAssignment[] = []
    total: number = 0
    radicals: number = 0
    kanji: number = 0
    vocabulary: number = 0

    constructor(public date: Date) {
    }

    push(d: WanikaniSubjectAssignment) {
        this.data.push(d);
        this.total = this.data.length;

        switch (d.subject?.object) {
            case 'radical':
                this.radicals += 1;
                break;
            case 'kanji':
                this.kanji += 1;
                break;
            case 'vocabulary':
                this.vocabulary += 1;
                break;
        }
    }
}

function formatData(assignments: WanikaniAssignment[], subjects: WanikaniSubject[]) {
    const subjectMap = createSubjectMap(subjects);
    const data: WanikaniSubjectAssignment[] = [];
    for (const assignment of assignments) {
        data.push({
            assignment: assignment,
            subject: subjectMap[assignment.subjectId]
        });
    }

    return data;
}

function aggregateDate(rawData: WanikaniSubjectAssignment[], daysToLookBack: number, unit: PeriodUnit): DataPoint[] {
    const areDatesDifferent = (date1: Date, date2: Date) => unit.trunc(date1).getTime() != unit.trunc(date2).getTime();
    const startDate = unit.trunc(Date.now() - (1000 * 60 * 60 * 24 * (daysToLookBack - 1))).getTime();
    const dataForTimeRange = rawData
        .filter(data => data.assignment.startedAt && data.assignment.startedAt.getTime() > startDate)
        .sort((a, b) => a.assignment.startedAt!.getTime() - b.assignment.startedAt!.getTime());

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
    const firstLessonDate = daysToLookBack > 365 ? unit.trunc(dataForTimeRange[0].assignment.startedAt!) : new Date(startDate);

    const aggregatedData: DataPoint[] = [new DataPoint(firstLessonDate)];
    for (const data of dataForTimeRange) {
        if (areDatesDifferent(aggregatedData[aggregatedData.length - 1].date, data.assignment.startedAt!)) {
            fillInEmptyPeriodsIfNeeded(aggregatedData, data.assignment.startedAt!);
            aggregatedData.push(new DataPoint(unit.trunc(data.assignment.startedAt!)));
        }

        aggregatedData[aggregatedData.length - 1].push(data);
    }

    // Fill in DataPoints if there are no lessons between last DataPoint and the current period
    const currentPeriod = unit.trunc(new Date());
    if (currentPeriod.getTime() !== aggregatedData[aggregatedData.length - 1].date.getTime()) {
        fillInEmptyPeriodsIfNeeded(aggregatedData, currentPeriod);
    }

    return aggregatedData;
}

function getTotalDays() {
    const firstDate = truncDate(new Date(2000, 0, 1));
    const today = truncDate(Date.now());
    const difference = today.getTime() - firstDate.getTime();
    return millisToDays(difference);
}

function calculateLabelPositions(data: DataPoint[], isMobile: boolean = false) {
    const labelsForDesktop = data.length == 7 ? 7 : 6;
    const numberOfLabels = isMobile ? 3 : (labelsForDesktop);
    return getVisibleLabelIndices(data, numberOfLabels);
}

type UnitSelectorProps = {
    options: PeriodUnit[],
    unit: PeriodUnit,
    onChange: (unit: PeriodUnit) => void,
};

function UnitSelector({ options, unit, onChange }: UnitSelectorProps) {
    return (
        <Select
            style={{ minWidth: '130px' }}
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

type WanikaniLessonHistoryChartProps = {
    subjects: WanikaniSubject[],
    assignments: WanikaniAssignment[],
};

function WanikaniLessonHistoryChart({ assignments, subjects }: WanikaniLessonHistoryChartProps) {
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const [tooltipTargetItem, setTooltipTargetItem] = useState<SeriesRef>();
    const [unit, setUnit] = useState(units.days);
    const isLoading = assignments.length === 0 || subjects.length === 0;
    const rawData = useMemo(() => isLoading ? [] : formatData(assignments, subjects), [assignments, subjects]);
    const { isMobile } = useDeviceInfo();

    const chartData: DataPoint[] = useMemo(() => rawData.length == 0 ? [] :
        aggregateDate(rawData, daysToLookBack, unit), [rawData, daysToLookBack, unit])

    const LessonToolTip = useMemo(() => {
        function getDateLabelText(date: Date): string {
            if (unit.key === units.days.key)
                return date.toLocaleDateString()
            else if (unit.key === units.weeks.key)
                return date.toLocaleDateString()
            else if (unit.key === units.months.key)
                return `${getMonthName(date, true)} ${date.getFullYear()}`
            return '';
        }

        return function LessonToolTip({ targetItem }: TooltipBase.ContentProps) {
            const data = chartData[targetItem.point];
            return (
                <>
                    <ToolTipLabel title="Date" value={getDateLabelText(data.date)} />
                    <br />
                    <ToolTipLabel title="Total" value={data.total} />
                    <ToolTipLabel title="Radicals" value={data.radicals} />
                    <ToolTipLabel title="Kanji" value={data.kanji} />
                    <ToolTipLabel title="Vocabulary" value={data.vocabulary} />
                </>
            );
        }
    }, [chartData, unit]);


    const LabelWithDate = useMemo(() => {
        const visibleLabelIndices = calculateLabelPositions(chartData, isMobile);

        return function LabelWithDate(props: ValueAxisBase.LabelProps) {
            const date = props.text;
            if (!date) {
                return null;
            }

            const index = chartData.findIndex(d => new Date(d.date).getTime() === new Date(date).getTime());

            if (!visibleLabelIndices.includes(index)) {
                return null;
            }

            return (
                <ArgumentAxis.Label
                    {...props}
                    text={new Date(date).toLocaleDateString()}
                />
            );
        }
    }, [chartData]);

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <GridLegacy container>
                        <GridLegacy item xs={12} md={4}>
                            <UnitSelector
                                options={[
                                    units.days,
                                    units.weeks,
                                    units.months
                                ]}
                                unit={unit}
                                onChange={setUnit}
                            />
                        </GridLegacy>
                        <GridLegacy item xs={12} md={4}>
                            <Typography variant={'h5'} style={{ textAlign: 'center', paddingBottom: '5px' }}>
                                Lesson History
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
                                        { value: totalDays, text: 'All' },
                                    ]}
                                />
                            </GridLegacy>
                        )}
                    </GridLegacy>

                    {!isLoading ? (
                        <div style={{ flexGrow: '1' }}>
                            <Chart data={chartData}>
                                <ArgumentScale factory={scaleBand} />
                                <ArgumentAxis labelComponent={LabelWithDate} />
                                <ValueAxis />

                                <BarSeries
                                    name="radicals"
                                    valueField="radicals"
                                    argumentField="date"
                                    color={WANIKANI_COLORS.blue}
                                />

                                <BarSeries
                                    name="kanji"
                                    valueField="kanji"
                                    argumentField="date"
                                    color={WANIKANI_COLORS.pink}
                                />

                                <BarSeries
                                    name="vocabulary"
                                    valueField="vocabulary"
                                    argumentField="date"
                                    color={WANIKANI_COLORS.purple}
                                />

                                <Stack
                                    stacks={[{ series: ['radicals', 'kanji', 'vocabulary'] }]}
                                />

                                <EventTracker />
                                <Tooltip
                                    targetItem={tooltipTargetItem ? {
                                        ...tooltipTargetItem,
                                        series: 'vocabulary'
                                    } : undefined}
                                    onTargetItemChange={setTooltipTargetItem}
                                    contentComponent={LessonToolTip}
                                />
                            </Chart>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}


// Wrapper to catch any errors
function WanikaniLessonHistoryChartErrorWrapper(props: WanikaniLessonHistoryChartProps) {
    return (
        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
            <WanikaniLessonHistoryChart {...props} />
        </ErrorBoundary>
    );
}

export default WanikaniLessonHistoryChartErrorWrapper;
