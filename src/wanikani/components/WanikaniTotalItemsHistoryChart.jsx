import { Chart, ValueAxis, ArgumentAxis, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import { LineSeries } from "@devexpress/dx-react-chart";
import { wanikaniColors } from '../../Constants.js';
import { Checkbox, Card, CardContent, Typography, Grid, FormControlLabel } from "@mui/material";
import { EventTracker, Animation } from "@devexpress/dx-react-chart";

const LabelWithDate = (props) => {
    const { text } = props;
    const rawTimestamp = parseInt(text.split(',').join(''));
    return (
        <ValueAxis.Label
            {...props}
            text={new Date(rawTimestamp).toLocaleDateString()}
        />
    );
};

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
};

function truncDate(date) {
    return new Date(new Date(date).toDateString());
}

async function fetchData() {
    const assignments = await WanikaniApiService.getAllAssignments();
    const orderedAssignments = assignments
        .filter(assignemnt => !!assignemnt.data['started_at'])
        .map(assignemnt => ({
            subjectId: assignemnt.data['subject_id'],
            type: assignemnt.data['subject_type'],
            startedAt: new Date(assignemnt.data['started_at']),
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
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, []);

    const data = rawData.map(dp => {
        return {
            ...dp,
            radicals: showRadicals ? dp.radicals : null,
            kanji: showKanji ? dp.kanji : null,
            vocabulary: showVocabulary ? dp.vocabulary : null,
        };
    })


    function ItemToolTip(props) {
        const dataPoint = data[props.targetItem.point];
        return (
            <>
                <p>{new Date(dataPoint.date).toLocaleDateString()}</p>
                <p>Count: {dataPoint[props.targetItem.series]}</p>
            </>
        );
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Grid container>
                        <Grid item xs={12} md={4}/>
                        <Grid item xs={12} md={4}>
                            <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                                Total Items
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4} style={{ textAlign: 'end' }}>
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

                    </Grid>

                    <div style={{ flexGrow: '1' }}>
                        <Chart data={data}>
                            <ValueAxis />
                            <ArgumentAxis
                                labelComponent={LabelWithDate}
                            />
                            <LineSeries
                                name="radicals"
                                valueField="radicals"
                                argumentField="date"
                                color={wanikaniColors.blue}
                            />

                            <LineSeries
                                name="kanji"
                                valueField="kanji"
                                argumentField="date"
                                color={wanikaniColors.pink}
                            />

                            <LineSeries
                                name="vocabulary"
                                valueField="vocabulary"
                                argumentField="date"
                                color={wanikaniColors.purple}
                            />

                            <EventTracker />
                            <Tooltip contentComponent={ItemToolTip} />
                        </Chart>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniTotalItemsHistoryChart;