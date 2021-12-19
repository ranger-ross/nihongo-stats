import { Chart, ValueAxis, BarSeries, ArgumentAxis, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Animation, EventTracker, Stack } from "@devexpress/dx-react-chart";
import { Card, CardContent, ButtonGroup, Button, Typography, Box } from "@mui/material";
import { addDays, areDatesSameDay } from '../../util/DateUtils';
import { wanikaniColors } from '../../Constants';

function WanikaniFutureReviewsChart() {
    const [rawData, setRawData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [targetItem, setTargetItem] = useState();
    const [days, setDays] = useState(14);

    useEffect(() => {
        let isSubscribed = true;
        WanikaniApiService.getAllAssignments()
            .then(data => {
                if (!isSubscribed)
                    return;
                const _rawData = data.filter(assignment => !assignment.data['burned_at'] || !assignment.data['available_at']);
                setRawData(_rawData);
            })
        return () => isSubscribed = false;
    }, []);


    useEffect(() => {
        if (!rawData || rawData.length == 0) {
            return;
        }

        const data = rawData
            .filter(assignment => new Date(assignment.data['available_at']) > addDays(new Date(), -1))
            .filter(assignment => new Date(assignment.data['available_at']) < addDays(new Date(), days));

        let daysData = []
        for (let i = 0; i < days; i++) {
            const date = addDays(new Date(), i)
            const assignmentsOnDay = data.filter(assignment => areDatesSameDay(new Date(assignment.data['available_at']), date))

            daysData.push({
                radicals: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'radical').length,
                kanji: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'kanji').length,
                vocabulary: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'vocabulary').length,
                reviews: assignmentsOnDay.length,
                label: `${date.getMonth() + 1}/${date.getDate()}`
            });
        }

        setChartData(daysData);
    }, [rawData, days]);

    function ReviewsToolTip({ targetItem }) {
        const { reviews, radicals, kanji, vocabulary } = chartData[targetItem.point];
        return (
            <div>
                Total: {reviews}
                <br />
                Radicals: {radicals}
                <br />
                Kanji: {kanji}
                <br />
                Vocabulary: {vocabulary}
            </div>
        );
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box />
                        <Typography variant={'h5'}>
                            Future Reviews
                        </Typography>

                        <ButtonGroup variant={'contained'} color={'primary'} >
                            <Button variant={days === 7 ? 'contained' : null} onClick={() => setDays(7)}>7</Button>
                            <Button variant={days === 14 ? 'contained' : null} onClick={() => setDays(14)}>14</Button>
                            <Button variant={days === 30 ? 'contained' : null} onClick={() => setDays(30)}>30</Button>
                        </ButtonGroup>
                    </div>

                    <div style={{ flexGrow: '1' }}>
                        <Chart data={chartData}>
                            <ValueAxis />
                            <ArgumentAxis />

                            <BarSeries
                                name="radicals"
                                valueField="radicals"
                                argumentField="label"
                                color={wanikaniColors.blue}
                            />

                            <BarSeries
                                name="kanji"
                                valueField="kanji"
                                argumentField="label"
                                color={wanikaniColors.pink}
                            />

                            <BarSeries
                                name="vocabulary"
                                valueField="vocabulary"
                                argumentField="label"
                                color={wanikaniColors.purple}
                            />

                            <Stack
                                stacks={[{ series: ['radicals', 'kanji', 'vocabulary'] }]}
                            />

                            <EventTracker />
                            <Tooltip targetItem={targetItem}
                                onTargetItemChange={setTargetItem}
                                contentComponent={ReviewsToolTip}
                            />
                            <Animation />
                        </Chart>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniFutureReviewsChart;