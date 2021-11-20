import { Chart, ValueAxis, ArgumentAxis, Title } from '@devexpress/dx-react-chart-material-ui';
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { LineSeries } from "@devexpress/dx-react-chart";
import { wanikaniColors } from '../../Constants';

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
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData()
            .then(setData)
            .catch(console.error);
    }, []);

    return (
        <Chart data={data}>
            <ValueAxis />
            <ArgumentAxis
                labelComponent={LabelWithDate}
            />
            <Title text="Total Items" />
            <LineSeries
                valueField="radicals"
                argumentField="date"
                color={wanikaniColors.blue}
            />
            <LineSeries
                valueField="kanji"
                argumentField="date"
                color={wanikaniColors.pink}
            />

            <LineSeries
                valueField="vocabulary"
                argumentField="date"
                color={wanikaniColors.purple}
            />
        </Chart>
    );
}

export default WanikaniTotalItemsHistoryChart;