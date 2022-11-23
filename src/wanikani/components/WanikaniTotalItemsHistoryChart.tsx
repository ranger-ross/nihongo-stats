import {ArgumentAxis, Chart, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import React, {useEffect, useMemo, useState} from "react";
import {EventTracker, LineSeries, Tooltip as TooltipBase, ValueAxis as ValueAxisBase} from "@devexpress/dx-react-chart";
import {WANIKANI_COLORS} from '../../Constants';
import {Card, CardContent, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector";
import {daysToMillis, millisToDays, truncDate} from "../../util/DateUtils";
import {WanikaniSubjectType} from "../models/WanikaniSubject";
import {WanikaniAssignment} from "../models/WanikaniAssignment";
import {ErrorBoundary} from "react-error-boundary";
import {GenericErrorMessage} from "../../shared/GenericErrorMessage";

function LabelWithDate(props: ValueAxisBase.LabelProps) {
    const {text} = props;
    const rawTimestamp = parseInt((text as string).split(',').join(''));
    return (
        <ValueAxis.Label
            {...props}
            text={new Date(rawTimestamp).toLocaleDateString()}
        />
    );
}

function sortByStartedAtDate(a: AssignmentSnippet, b: AssignmentSnippet) {
    if (a.startedAt.getTime() < b.startedAt.getTime()) {
        return -1;
    }
    if (a.startedAt.getTime() > b.startedAt.getTime()) {
        return 1;
    }
    return 0;
}

class DataPoint {

    radicals: number = 0
    kanji: number = 0
    vocabulary: number = 0

    constructor(public date: Date, previousDataPoint?: DataPoint) {
        if (!!previousDataPoint) {
            this.radicals = previousDataPoint.radicals;
            this.kanji = previousDataPoint.kanji;
            this.vocabulary = previousDataPoint.vocabulary;
        }
    }

    total() {
        return this.radicals + this.kanji + this.vocabulary
    }
}

type AssignmentSnippet = {
    subjectId: number,
    type: WanikaniSubjectType,
    startedAt: Date,
};

function formatData(assignments: WanikaniAssignment[]) {
    const orderedAssignments: AssignmentSnippet[] = assignments
        .filter(assignment => !!assignment.startedAt)
        .map(assignment => ({
            subjectId: assignment.subjectId,
            type: assignment.subjectType,
            startedAt: assignment.startedAt as Date,
        } as AssignmentSnippet))
        .sort(sortByStartedAtDate)


    const data: DataPoint[] = [new DataPoint(truncDate(orderedAssignments[0].startedAt))];
    for (const assignment of orderedAssignments) {
        if (data[data.length - 1].date.getTime() != truncDate(assignment.startedAt).getTime()) {
            data.push(new DataPoint(truncDate(assignment.startedAt), data[data.length - 1]));
        }
        const _dataPoint = data[data.length - 1];
        if (assignment.type === 'radical') {
            _dataPoint.radicals += 1;
        }
        if (assignment.type === 'kanji') {
            _dataPoint.kanji += 1;
        }
        if (assignment.type === 'vocabulary') {
            _dataPoint.vocabulary += 1;
        }
    }
    return data;
}

function useOptions(rawData: DataPoint[]) {
    const options = [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},

    ];

    if (!!rawData && rawData.length > 0) {
        options.push({
            value: millisToDays(Date.now() - rawData[0].date.getTime()),
            text: 'All'
        });
    }
    return options;
}

type WanikaniTotalItemsHistoryChartProps = {
    assignments: WanikaniAssignment[]
};

function WanikaniTotalItemsHistoryChart({assignments}: WanikaniTotalItemsHistoryChartProps) {
    const rawData: DataPoint[] = useMemo(() => assignments.length > 0 ? formatData(assignments) : [], [assignments])
    const [daysToLookBack, setDaysToLookBack] = useState(10000);
    const [showRadicals, setShowRadicals] = useState(true);
    const [showKanji, setShowKanji] = useState(true);
    const [showVocabulary, setShowVocabulary] = useState(true);
    const options = useOptions(rawData);

    useEffect(() => {
        if (rawData.length > 0)
            setDaysToLookBack(millisToDays(Date.now() - rawData[0].date.getTime()));
    }, [rawData]);

    const chartData = useMemo(() => rawData ? (
        rawData
            .filter(dp => new Date(dp.date).getTime() > Date.now() - daysToMillis(daysToLookBack))
            .map(dp => ({
                ...dp,
                radicals: showRadicals ? dp.radicals : null,
                kanji: showKanji ? dp.kanji : null,
                vocabulary: showVocabulary ? dp.vocabulary : null,
            }))
    ) : [], [rawData, showRadicals, showKanji, showVocabulary, daysToLookBack]);

    function ItemToolTip(props: TooltipBase.ContentProps) {
        const dataPoint = chartData[props.targetItem.point];
        const s = props.targetItem.series as 'radicals' | 'kanji' | 'vocabulary';
        return (
            <>
                <p>{new Date(dataPoint.date).toLocaleDateString()}</p>
                <p>Count: {dataPoint[s]?.toLocaleString()}</p>
            </>
        );
    }

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <Grid container>
                        <Grid item xs={12} md={4} style={{textAlign: 'start'}}>
                            <FormControlLabel label="Radicals"
                                              control={
                                                  <Checkbox checked={showRadicals}
                                                            color={'primary'}
                                                            disabled={!showKanji && !showVocabulary}
                                                            onChange={e => setShowRadicals(e.target.checked)}
                                                  />
                                              }
                            />

                            <FormControlLabel label="Kanji"
                                              control={
                                                  <Checkbox checked={showKanji}
                                                            color={'primary'}
                                                            disabled={!showRadicals && !showVocabulary}
                                                            onChange={e => setShowKanji(e.target.checked)}
                                                  />
                                              }
                            />

                            <FormControlLabel label="Vocabulary"
                                              control={
                                                  <Checkbox checked={showVocabulary}
                                                            color={'primary'}
                                                            disabled={!showRadicals && !showKanji}
                                                            onChange={e => setShowVocabulary(e.target.checked)}
                                                  />
                                              }
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant={'h5'} style={{textAlign: 'center'}}>
                                Total Items
                            </Typography>
                        </Grid>


                        <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                            <PeriodSelector period={daysToLookBack}
                                            setPeriod={setDaysToLookBack}
                                            options={options}
                            />
                        </Grid>

                    </Grid>

                    <div style={{flexGrow: '1'}}>
                        <Chart data={chartData}>
                            <ValueAxis/>
                            <ArgumentAxis
                                labelComponent={LabelWithDate}
                            />
                            <LineSeries
                                name="radicals"
                                valueField="radicals"
                                argumentField="date"
                                color={WANIKANI_COLORS.blue}
                            />

                            <LineSeries
                                name="kanji"
                                valueField="kanji"
                                argumentField="date"
                                color={WANIKANI_COLORS.pink}
                            />

                            <LineSeries
                                name="vocabulary"
                                valueField="vocabulary"
                                argumentField="date"
                                color={WANIKANI_COLORS.purple}
                            />

                            <EventTracker/>
                            <Tooltip contentComponent={ItemToolTip}/>
                        </Chart>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Wrapper to catch any errors
function WanikaniTotalItemsHistoryChartErrorWrapper(props: WanikaniTotalItemsHistoryChartProps) {
    return (
        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
            <WanikaniTotalItemsHistoryChart {...props} />
        </ErrorBoundary>
    );
}

export default WanikaniTotalItemsHistoryChartErrorWrapper;
