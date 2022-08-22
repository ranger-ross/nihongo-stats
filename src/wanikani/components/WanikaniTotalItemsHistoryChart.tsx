import {ArgumentAxis, Chart, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import React, {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import {EventTracker, LineSeries, Tooltip as TooltipBase, ValueAxis as ValueAxisBase} from "@devexpress/dx-react-chart";
import {WanikaniColors} from '../../Constants';
import {Card, CardContent, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector";
import {daysToMillis, millisToDays, truncDate} from "../../util/DateUtils";
import {WanikaniSubjectType} from "../models/WanikaniSubject";

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

type DataPoint = {
    date: Date,
    radicals: number,
    kanji: number,
    vocabulary: number,
    total: () => number
};

function dataPoint(date: Date, previousDataPoint?: DataPoint): DataPoint {
    const data = {
        date: date,
        radicals: 0,
        kanji: 0,
        vocabulary: 0,
        total: () => 0
    };

    if (!!previousDataPoint) {
        data.radicals = previousDataPoint.radicals;
        data.kanji = previousDataPoint.kanji;
        data.vocabulary = previousDataPoint.vocabulary;
    }

    data.total = () => data.radicals + data.kanji + data.vocabulary;

    return data;
}

type AssignmentSnippet = {
    subjectId: number,
    type: WanikaniSubjectType,
    startedAt: Date,
};

async function fetchData() {
    const assignments = await WanikaniApiService.getAllAssignmentsV2();
    const orderedAssignments: AssignmentSnippet[] = assignments
        .filter(assignment => !!assignment.startedAt)
        .map(assignment => ({
            subjectId: assignment.subjectId,
            type: assignment.subjectType,
            startedAt: assignment.startedAt as Date,
        } as AssignmentSnippet))
        .sort(sortByStartedAtDate)


    const data: DataPoint[] = [dataPoint(truncDate(orderedAssignments[0].startedAt))];
    for (const assignment of orderedAssignments) {
        if (data[data.length - 1].date.getTime() != truncDate(assignment.startedAt).getTime()) {
            data.push(dataPoint(truncDate(assignment.startedAt), data[data.length - 1]));
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

function WanikaniTotalItemsHistoryChart() {
    const [rawData, setRawData] = useState<DataPoint[]>([]);
    const [daysToLookBack, setDaysToLookBack] = useState(10000);
    const [showRadicals, setShowRadicals] = useState(true);
    const [showKanji, setShowKanji] = useState(true);
    const [showVocabulary, setShowVocabulary] = useState(true);
    const options = useOptions(rawData);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
                setDaysToLookBack(millisToDays(Date.now() - data[0].date.getTime()));
            })
            .catch(console.error);
        return () => {
            isSubscribed = false;
        };
    }, []);

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
                        {/*@ts-ignore*/}
                        <Chart data={chartData}>
                            <ValueAxis/>
                            <ArgumentAxis
                                labelComponent={LabelWithDate}
                            />
                            <LineSeries
                                name="radicals"
                                valueField="radicals"
                                argumentField="date"
                                color={WanikaniColors.blue}
                            />

                            <LineSeries
                                name="kanji"
                                valueField="kanji"
                                argumentField="date"
                                color={WanikaniColors.pink}
                            />

                            <LineSeries
                                name="vocabulary"
                                valueField="vocabulary"
                                argumentField="date"
                                color={WanikaniColors.purple}
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

export default WanikaniTotalItemsHistoryChart;
