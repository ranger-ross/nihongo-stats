import { Chart, ValueAxis, ArgumentAxis, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { ArgumentScale, BarSeries, Stack } from "@devexpress/dx-react-chart";
import { wanikaniColors } from '../../Constants';
import { Card, CardContent, Typography, Grid, ButtonGroup, Button, CircularProgress } from "@material-ui/core";
import { EventTracker } from "@devexpress/dx-react-chart";
import { scaleBand } from 'd3-scale';
import React from 'react';

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

        switch (d.subject.object) {
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
};

function truncDate(date) {
    return new Date(new Date(date).toDateString());
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


    function ReviewsToolTip({ targetItem }) {
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

    const LabelWithDate = (props) => {
        const date = props.text;
        if (!date) {
            return (<></>)
        }

        const totalLabels = 6;
        const labelTickSize = Math.floor(daysToLookBack / totalLabels);
        const days = Math.floor(Date.now() - date.getTime() / 86400000);
        return (
            <>
                {days % labelTickSize == 0 ? (
                    <ArgumentAxis.Label
                        {...props}
                        text={new Date(date).toLocaleDateString()}
                    />
                ) : null}
            </>
        );
    };

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Grid container>
                        <Grid item xs={12} md={4} />
                        <Grid item xs={12} md={4} >
                            <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                                Review History
                            </Typography>
                        </Grid>


                        {isLoading ? (
                            <Grid item container xs={12} justifyContent={'center'} style={{ padding: '10px' }}>
                                <CircularProgress />
                            </Grid>
                        ) : (
                            <Grid item xs={12} md={4} style={{ textAlign: 'end' }}>
                                <ButtonGroup variant="outlined" color={'primary'} >
                                    <Button variant={daysToLookBack === 7 ? 'contained' : null} onClick={() => setDaysToLookBack(7)}>7</Button>
                                    <Button variant={daysToLookBack === 14 ? 'contained' : null} onClick={() => setDaysToLookBack(14)}>14</Button>
                                    <Button variant={daysToLookBack === 30 ? 'contained' : null} onClick={() => setDaysToLookBack(30)}>30</Button>
                                    <Button variant={daysToLookBack === 90 ? 'contained' : null} onClick={() => setDaysToLookBack(90)}>3 Mon</Button>
                                    <Button variant={daysToLookBack === 180 ? 'contained' : null} onClick={() => setDaysToLookBack(180)}>6 Mon</Button>
                                    <Button variant={daysToLookBack === 365 ? 'contained' : null} onClick={() => setDaysToLookBack(365)}>1 Yr</Button>
                                    <Button variant={daysToLookBack === totalDays ? 'contained' : null} onClick={() => setDaysToLookBack(totalDays)}>All</Button>
                                </ButtonGroup>
                            </Grid>
                        )}
                    </Grid>

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
                                    stacks={[{ series: ['radicals', 'kanji', 'vocabulary'] }]}
                                />

                                <EventTracker />
                                <Tooltip contentComponent={ReviewsToolTip} />
                            </Chart>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniReviewsHistoryChart;