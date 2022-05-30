import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import React, {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {EventTracker, ScatterSeries, SplineSeries, ValueScale} from "@devexpress/dx-react-chart";
import {WanikaniColors} from '../../Constants.js';
import {Card, CardContent, Grid, Typography} from "@mui/material";
import _ from 'lodash';
import {scaleLinear} from 'd3-scale';
import PeriodSelector from "../../shared/PeriodSelector.jsx";
import {createSubjectMap} from "../service/WanikaniDataUtil.js";
import {millisToDays} from "../../util/DateUtils.ts";

const scale = () => scaleLinear();
const modifyDomain = () => [0, 100];

function LabelWithDate(props) {
    const {text} = props;
    const rawTimestamp = parseInt(text.split(',').join(''));
    return (
        <ArgumentAxis.Label
            {...props}
            text={new Date(rawTimestamp).toLocaleDateString()}
        />
    );
}

function PercentageLabel(props) {
    const {text} = props;
    return (
        <ValueAxis.Label
            {...props}
            text={text + '%'}
        />
    );
}

function truncDate(date) {
    return new Date(new Date(date).toDateString());
}

function calculateRollingAverageOfDaysInQueue(queue) {
    let total = 0;
    let incorrectCount = 0;

    for (const day of queue) {
        total += day.total;
        incorrectCount += day.incorrectCount;
    }

    return Number((((total - incorrectCount) / total) * 100).toFixed(2));
}

async function fetchData() {
    const reviews = await WanikaniApiService.getReviews();
    const subjects = createSubjectMap(await WanikaniApiService.getSubjects());
    let data = [];
    for (const review of reviews) {
        data.push({
            review: review,
            subject: subjects[review.data['subject_id']]
        });
    }
    const groupedData = _.groupBy(data, v => truncDate(v.review.data['created_at']));
    const groupedDataAsMap = new Map(Object.entries(groupedData));
    let result = Array.from(groupedDataAsMap, ([date, data]) => {
        const total = data.length;
        let incorrectCount = 0;
        for (const {review} of data) {
            const isIncorrect = review.data['incorrect_meaning_answers'] > 0 || review.data['incorrect_reading_answers'] > 0;
            if (isIncorrect)
                incorrectCount += 1;
        }

        return {
            date: new Date(date),
            ratio: Number((((total - incorrectCount) / total) * 100).toFixed(2)),
            total: total,
            incorrectCount: incorrectCount,
        };
    });

    // Calculate 7 day rolling average
    let queue = [];
    for (const day of result) {
        queue.push(day);

        if (queue.length > 6)
            queue.shift();

        day.movingAverage = calculateRollingAverageOfDaysInQueue(queue);
    }

    return result;
}

const ROLLING_AVERAGE_LINE_COLOR = '#ffd500';

function getTotalDays() {
    const firstDate = truncDate(new Date(2000,0,1));
    const today = truncDate(Date.now());
    const difference = today.getTime() - firstDate.getTime();
    return millisToDays(difference);
}

const totalDays = getTotalDays();

function WanikaniAccuracyHistoryChart() {
    const [rawData, setRawData] = useState([]);
    const [daysToLookBack, setDaysToLookBack] = useState(90);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, []);


    const data = useMemo(() => rawData.filter(dp => dp.date.getTime() > (Date.now() - (1000 * 3600 * 24 * daysToLookBack))),
        [rawData, daysToLookBack]);

    function AccuracyToolTip({targetItem}) {
        const isAverageSeries = targetItem.series.toLowerCase().includes('average');
        const dataPoint = data[targetItem.point];
        return (
            <>
                <p>{new Date(dataPoint.date).toLocaleDateString()}</p>
                {isAverageSeries ? (
                    <p>7 Day Rolling Average: {dataPoint.movingAverage}%</p>
                ) : (
                    <p>Accuracy: {dataPoint.ratio}%</p>
                )}
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
                            <Typography variant={'h5'} style={{textAlign: 'center'}}>
                                Review Accuracy
                            </Typography>
                        </Grid>

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

                    </Grid>

                    <div style={{flexGrow: '1'}}>
                        <Chart data={data}>
                            <ValueScale factory={scale} modifyDomain={modifyDomain}/>
                            <ValueAxis labelComponent={PercentageLabel}/>
                            <ArgumentAxis labelComponent={LabelWithDate}/>
                            <ScatterSeries
                                name="Daily Accuracy"
                                valueField="ratio"
                                argumentField="date"
                                color={WanikaniColors.blue}
                            />

                            <SplineSeries
                                name="7 Day Rolling Average"
                                valueField="movingAverage"
                                argumentField="date"
                                color={ROLLING_AVERAGE_LINE_COLOR}
                            />

                            <Legend/>

                            <EventTracker/>
                            <Tooltip contentComponent={AccuracyToolTip}/>
                        </Chart>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniAccuracyHistoryChart;
