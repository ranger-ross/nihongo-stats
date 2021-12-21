import { Chart, ValueAxis, ArgumentAxis, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import { LineSeries, ValueScale } from "@devexpress/dx-react-chart";
import { wanikaniColors } from '../../Constants.js';
import { Card, CardContent, Typography, Grid, ButtonGroup, Button } from "@mui/material";
import { EventTracker } from "@devexpress/dx-react-chart";
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';

const scale = () => scaleLinear();
const modifyDomain = () => [0, 100];

const LabelWithDate = (props) => {
    const { text } = props;
    const rawTimestamp = parseInt(text.split(',').join(''));
    return (
        <ArgumentAxis.Label
            {...props}
            text={new Date(rawTimestamp).toLocaleDateString()}
        />
    );
};

const PercentageLabel = (props) => {
    const { text } = props;
    const rawTimestamp = parseInt(text.split(',').join(''));
    return (
        <ValueAxis.Label
            {...props}
            text={text + '%'}
        />
    );
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
    const groupedData = _.groupBy(data, v => truncDate(v.review.data['created_at']));
    const groupedDataAsMap = new Map(Object.entries(groupedData));
    const groupedDataAsArray = Array.from(groupedDataAsMap, ([date, data]) => {
        const total = data.length;
        let incorrectCount = 0;
        for (const { review } of data) {
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
    })
    return groupedDataAsArray;
}



function WanikaniAccuracyHistoryChart() {
    const [rawData, setRawData] = useState([]);
    const [data, setData] = useState([]);
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const [totalDays, setTotalDays] = useState(5000);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
                const difference = Date.now() - data[0].date.getTime();
                const days = Math.ceil(difference / (1000 * 3600 * 24));
                setTotalDays(days);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, []);


    useEffect(() => {
        setData(rawData.filter(dp => dp.date.getTime() > (Date.now() - (1000 * 3600 * 24 * daysToLookBack))));
    }, [rawData, daysToLookBack]);

    function AccuracyToolTip(props) {
        const dataPoint = data[props.targetItem.point];
        return (
            <>
                <p>{new Date(dataPoint.date).toLocaleDateString()}</p>
                <p>Accuracy: {dataPoint.ratio}%</p>
            </>
        );
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Grid container>
                        <Grid item xs={12} md={4} />
                        <Grid item xs={12} md={4}>
                            <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                                Review Accuracy
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4} style={{ textAlign: 'end' }}>
                            <ButtonGroup variant="outlined" color={'primary'} size="small" >
                                <Button variant={daysToLookBack === 7 ? 'contained' : undefined} onClick={() => setDaysToLookBack(7)}>7</Button>
                                <Button variant={daysToLookBack === 14 ? 'contained' : undefined} onClick={() => setDaysToLookBack(14)}>14</Button>
                                <Button variant={daysToLookBack === 30 ? 'contained' : undefined} onClick={() => setDaysToLookBack(30)}>30</Button>
                                <Button variant={daysToLookBack === 90 ? 'contained' : undefined} onClick={() => setDaysToLookBack(90)}>3 Mon</Button>
                                <Button variant={daysToLookBack === 180 ? 'contained' : undefined} onClick={() => setDaysToLookBack(180)}>6 Mon</Button>
                                <Button variant={daysToLookBack === 365 ? 'contained' : undefined} onClick={() => setDaysToLookBack(365)}>1 Yr</Button>
                                <Button variant={daysToLookBack === totalDays ? 'contained' : undefined} onClick={() => setDaysToLookBack(totalDays)}>All</Button>
                            </ButtonGroup>
                        </Grid>

                    </Grid>

                    <div style={{ flexGrow: '1' }}>
                        <Chart data={data}>
                            <ValueScale factory={scale} modifyDomain={modifyDomain} />
                            <ValueAxis labelComponent={PercentageLabel} />
                            <ArgumentAxis labelComponent={LabelWithDate} />
                            <LineSeries
                                valueField="ratio"
                                argumentField="date"
                                color={wanikaniColors.blue}
                            />

                            <EventTracker />
                            <Tooltip contentComponent={AccuracyToolTip} />
                        </Chart>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniAccuracyHistoryChart;