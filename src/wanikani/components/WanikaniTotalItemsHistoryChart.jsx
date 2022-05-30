import {ArgumentAxis, Chart, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import React, {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {EventTracker, LineSeries} from "@devexpress/dx-react-chart";
import {WanikaniColors} from '../../Constants.js';
import {Card, CardContent, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector.tsx";
import {daysToMillis, millisToDays} from "../../util/DateUtils.ts";

function LabelWithDate(props) {
    const {text} = props;
    const rawTimestamp = parseInt(text.split(',').join(''));
    return (
        <ValueAxis.Label
            {...props}
            text={new Date(rawTimestamp).toLocaleDateString()}
        />
    );
}

function sortByStartedAtDate(a, b) {
    if (a.startedAt.getTime() < b.startedAt.getTime()) {
        return -1;
    }
    if (a.startedAt.getTime() > b.startedAt.getTime()) {
        return 1;
    }
    return 0;
}

function DataPoint(date, previousDataPoint) {
    let data = {
        date: date,
        radicals: 0,
        kanji: 0,
        vocabulary: 0,
    };

    if (!!previousDataPoint) {
        data.radicals = previousDataPoint.radicals;
        data.kanji = previousDataPoint.kanji;
        data.vocabulary = previousDataPoint.vocabulary;
    }

    data.total = () => data.radicals + data.kanji + data.vocabulary;

    return data;
}

function truncDate(date) {
    return new Date(new Date(date).toDateString());
}

async function fetchData() {
    const assignments = await WanikaniApiService.getAllAssignments();
    const orderedAssignments = assignments
        .filter(assignment => !!assignment.data['started_at'])
        .map(assignment => ({
            subjectId: assignment.data['subject_id'],
            type: assignment.data['subject_type'],
            startedAt: new Date(assignment.data['started_at']),
        }))
        .sort(sortByStartedAtDate)


    let data = [new DataPoint(truncDate(orderedAssignments[0].startedAt))];
    for (const assignment of orderedAssignments) {
        if (data[data.length - 1].date.getTime() != truncDate(assignment.startedAt).getTime()) {
            data.push(new DataPoint(truncDate(assignment.startedAt), data[data.length - 1]));
        }
        const dataPoint = data[data.length - 1];
        if (assignment.type === 'radical') {
            dataPoint.radicals += 1;
        }
        if (assignment.type === 'kanji') {
            dataPoint.kanji += 1;
        }
        if (assignment.type === 'vocabulary') {
            dataPoint.vocabulary += 1;
        }
    }
    return data;
}

function WanikaniTotalItemsHistoryChart() {
    const [rawData, setRawData] = useState([]);
    const [daysToLookBack, setDaysToLookBack] = useState(10000);
    const [showRadicals, setShowRadicals] = useState(true);
    const [showKanji, setShowKanji] = useState(true);
    const [showVocabulary, setShowVocabulary] = useState(true);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
                setDaysToLookBack(millisToDays(Date.now() - data[0].date));
            })
            .catch(console.error);
        return () => isSubscribed = false;
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

    function ItemToolTip(props) {
        const dataPoint = chartData[props.targetItem.point];
        return (
            <>
                <p>{new Date(dataPoint.date).toLocaleDateString()}</p>
                <p>Count: {dataPoint[props.targetItem.series]?.toLocaleString()}</p>
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
                                            options={[
                                                {value: 30, text: '1 Mon'},
                                                {value: 60, text: '2 Mon'},
                                                {value: 90, text: '3 Mon'},
                                                {value: 180, text: '6 Mon'},
                                                !!rawData && rawData.length > 0 ? {
                                                    value: millisToDays(Date.now() - rawData[0].date),
                                                    text: 'All'
                                                } : null
                                            ]}
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
