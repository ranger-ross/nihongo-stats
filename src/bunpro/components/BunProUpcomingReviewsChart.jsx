import React, {useState, useEffect, useMemo} from "react";
import {Card, CardContent, Typography, Box} from "@mui/material";
import {truncDate} from '../../util/DateUtils.js';
import DaysSelector from "../../shared/DaysSelector.jsx";
import {scaleBand} from 'd3-scale';
import BunProApiService from "../service/BunProApiService.js";
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import {createGrammarPointsLookupMap} from "../service/BunProDataUtil.js";
import {Chart, Legend, Tooltip, ValueAxis, ArgumentAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Animation, ArgumentScale, BarSeries, EventTracker, Stack} from "@devexpress/dx-react-chart";

const JLPTLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

function filterDeadGhostReviews(review) {
    const fiveYearsFromNow = Date.now() + (1000 * 60 * 60 * 24 * 365 * 5)
    return new Date(review['next_review']).getTime() < fiveYearsFromNow;
}

function createEmptyDataPoint(date) {
    let emptyDataPoint = {
        date: date,
    };
    JLPTLevels.forEach(level => emptyDataPoint[level] = 0)
    return emptyDataPoint;
}

async function fetchData() {
    const reviewData = await BunProApiService.getAllReviews();
    const gp = await BunProApiService.getGrammarPoints();
    const grammarPointsMap = createGrammarPointsLookupMap(gp);

    const reviews = [...reviewData['reviews'], ...reviewData['ghost_reviews']]
        .filter(filterDeadGhostReviews);

    let data = [];
    for (const review of reviews) {
        const date = truncDate(review['next_review']);
        const index = data.findIndex(v => v.date.getTime() === date.getTime());
        const grammarPoint = grammarPointsMap[review['grammar_point_id']];
        const level = grammarPoint.level.replace('JLPT', 'N');

        if (index > -1) {
            if (!!data[index][level]) {
                data[index][level] += 1;
            } else {
                data[index][level] = 1;
            }
        } else {
            const dp = createEmptyDataPoint(date);
            dp[level] = 1;
            data.push(dp);
        }
    }

    return data;
}

function BunProUpcomingReviewsChart() {
    const [rawData, setRawData] = useState([]);
    const [targetItem, setTargetItem] = useState();
    const [days, setDays] = useState(14);

    useEffect(() => {
        let isSubscribed = true;

        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
            });
        return () => isSubscribed = false;
    }, []);

    const chartData = useMemo(
        () => rawData.filter((_, i) => i < days),
        [rawData, days]
    );

    console.log(chartData);

    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 14);

    const LabelWithDate = (props) => {
        const dateAsString = props.text;
        if (!dateAsString) {
            return (<></>);
        }
        const date = new Date(dateAsString)
        const index = chartData.findIndex(d => d.date.getTime() === date.getTime());
        if (!visibleLabelIndices.includes(index)) {
            return (<></>);
        }

        return (
            <ArgumentAxis.Label
                {...props}
                text={(date.getMonth() + 1) + '/' + (date.getDate())}
            />
        );
    };

    function ReviewsToolTip({targetItem}) {
        const dp = chartData[targetItem.point];

        let total = 0;
        for (const level of JLPTLevels) {
            if (dp[level])
                total += dp[level];
        }

        return (
            <>
                <p>Date: {dp.date.toLocaleDateString()}</p>
                <p>Total: {total}</p>

                {JLPTLevels.map(level => (
                    dp[level] ? <p key={level}>{level}: {dp[level]}</p> : null
                ))}
            </>
        );
    }

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Box/>
                        <Typography variant={'h5'}>
                            Upcoming Reviews
                        </Typography>

                        <DaysSelector days={days}
                                      setDays={setDays}
                                      options={[
                                          {value: 7, text: '7'},
                                          {value: 14, text: '14'},
                                          {value: 30, text: '30'},
                                      ]}
                        />
                    </div>

                    <div style={{flexGrow: '1'}}>
                        <Chart data={chartData}>
                            <ValueAxis/>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate}/>

                            {JLPTLevels.map(level => (
                                <BarSeries
                                    key={level}
                                    name={level}
                                    valueField={level}
                                    argumentField="date"
                                />
                            ))}

                            <Stack
                                stacks={[{series: JLPTLevels}]}
                            />

                            <Legend/>
                            <EventTracker/>
                            <Tooltip targetItem={targetItem}
                                     onTargetItemChange={setTargetItem}
                                     contentComponent={ReviewsToolTip}
                            />
                            <Animation/>
                        </Chart>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default BunProUpcomingReviewsChart;