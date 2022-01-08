import {Chart, ValueAxis, ArgumentAxis, Tooltip} from '@devexpress/dx-react-chart-material-ui';
import {useState, useEffect} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {ArgumentScale, BarSeries, Stack} from "@devexpress/dx-react-chart";
import {wanikaniColors} from '../../Constants.js';
import {Card, CardContent, Typography, Grid, CircularProgress} from "@mui/material";
import {EventTracker} from "@devexpress/dx-react-chart";
import {scaleBand} from 'd3-scale';
import React from 'react';
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import DaysSelector from "../../shared/DaysSelector.jsx";
import {truncDate} from "../../util/DateUtils.js";

function DataPoint(date) {
    let data = {
        date: date,
        data: [],
        total: 0,
        radicals: 0,
        kanji: 0,
        vocabulary: 0,
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

function createSubjectMap(subjects) {
    let map = {};

    for (const subject of subjects) {
        map[subject.id] = subject;
    }

    return map;
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

    return data;
}

function aggregateDate(rawData, daysToLookBack) {
    const startDate = Date.now() - (1000 * 60 * 60 * 24 * (daysToLookBack - 1));

    let dataForTimeRange = rawData;
    if (daysToLookBack != -1) {
        dataForTimeRange = rawData.filter(data => new Date(data.review['data_updated_at']).getTime() > startDate);
    }

    let aggregatedDate = [new DataPoint(truncDate(dataForTimeRange[0].review['data_updated_at']))];
    for (const data of dataForTimeRange) {
        if (aggregatedDate[aggregatedDate.length - 1].date.getTime() != truncDate(data.review['data_updated_at']).getTime()) {
            aggregatedDate.push(new DataPoint(truncDate(data.review['data_updated_at'])));
        }

        aggregatedDate[aggregatedDate.length - 1].push(data);
    }

    return aggregatedDate;
}

function calculateLabelPositions(data) {
    const numberOfLabels = data.length == 7 ? 7 : 6
    return getVisibleLabelIndices(data, numberOfLabels);
}

function WanikaniReviewsHistoryChart() {
    const [rawData, setRawData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const [totalDays, setTotalDays] = useState(5000);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setTotalDays(aggregateDate(data, -1).length);
                setRawData(data);
                setIsLoading(false);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, []);

    useEffect(() => {
        if (rawData.length == 0) {
            return;
        }
        setChartData(aggregateDate(rawData, daysToLookBack));
    }, [rawData, daysToLookBack])


    function ReviewsToolTip({targetItem}) {
        const data = chartData[targetItem.point];
        return (
            <>
                <p>Date: {data.date.toLocaleDateString()}</p>
                <p>Total: {data.total}</p>
                <p>Radicals: {data.radicals}</p>
                <p>Kanji: {data.kanji}</p>
                <p>Vocabulary: {data.vocabulary}</p>
            </>
        );
    }

    const visibleLabelIndices = calculateLabelPositions(chartData);

    const LabelWithDate = (props) => {
        const date = props.text;
        if (!date) {
            return (<></>);
        }

        const index = chartData.findIndex(d => d.date === date);

        if (!visibleLabelIndices.includes(index)) {
            return (<></>);
        }

        return (
            <>
                <ArgumentAxis.Label
                    {...props}
                    text={new Date(date).toLocaleDateString()}
                />
            </>
        );
    };

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <Grid container>
                        <Grid item xs={12} md={4}/>
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
                                <DaysSelector days={daysToLookBack}
                                              setDays={setDaysToLookBack}
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
                            <Chart data={chartData}>
                                <ArgumentScale factory={scaleBand}/>
                                <ArgumentAxis labelComponent={LabelWithDate}/>
                                <ValueAxis/>

                                <BarSeries
                                    name="radicals"
                                    valueField="radicals"
                                    argumentField="date"
                                    color={wanikaniColors.blue}
                                />

                                <BarSeries
                                    name="kanji"
                                    valueField="kanji"
                                    argumentField="date"
                                    color={wanikaniColors.pink}
                                />

                                <BarSeries
                                    name="vocabulary"
                                    valueField="vocabulary"
                                    argumentField="date"
                                    color={wanikaniColors.purple}
                                />

                                <Stack
                                    stacks={[{series: ['radicals', 'kanji', 'vocabulary']}]}
                                />

                                <EventTracker/>
                                <Tooltip contentComponent={ReviewsToolTip}/>
                            </Chart>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniReviewsHistoryChart;