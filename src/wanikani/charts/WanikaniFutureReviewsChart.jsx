import { Chart, ValueAxis, BarSeries, ArgumentAxis, Title, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { EventTracker } from "@devexpress/dx-react-chart";
import { Card, CardContent } from "@material-ui/core";
import { addDays, areDatesSameDay } from '../../util/DateUtils';


function WanikaniFutureReviewsChart() {
    const days = 14;
    const { apiKey } = useWanikaniApiKey();
    const [rawData, setRawData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [targetItem, setTargetItem] = useState();

    useEffect(() => {
        WanikaniApiService.getAllAssignments(apiKey)
            .then(data => {
                const _rawData = data.filter(assignment => !assignment.data['burned_at'] || !assignment.data['available_at']);
                setRawData(_rawData);
            })
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
    }, [rawData]);

    function ReviewsToolTip({ targetItem }) {
        const { radicals, kanji, vocabulary } = chartData[targetItem.point];
        return (
            <div>
                Radicals: {radicals}
                <br />
                Kanji: {kanji}
                <br />
                Vocabulary: {vocabulary}
            </div>
        );
    }

    return (
        <Card>
            <CardContent>
                <Chart data={chartData}>
                    <ValueAxis />
                    <ArgumentAxis />
                    <Title text="Future Reviews" />
                    <BarSeries
                        valueField="reviews"
                        argumentField="label"
                    />
                    <EventTracker />
                    <Tooltip targetItem={targetItem}

                        onTargetItemChange={setTargetItem}
                        contentComponent={ReviewsToolTip}
                    />
                </Chart>
            </CardContent>
        </Card>
    );
}

export default WanikaniFutureReviewsChart;