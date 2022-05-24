import {Chart, ValueAxis, ArgumentAxis, Tooltip} from '@devexpress/dx-react-chart-material-ui';
import {useState, useEffect, useMemo} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {ArgumentScale, BarSeries, Stack} from "@devexpress/dx-react-chart";
import {WanikaniColors} from '../../Constants.js';
import {Card, CardContent, Typography, Grid, CircularProgress, Select, MenuItem} from "@mui/material";
import {EventTracker} from "@devexpress/dx-react-chart";
import {scaleBand} from 'd3-scale';
import React from 'react';
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import PeriodSelector from "../../shared/PeriodSelector.jsx";
import {addDays, getMonthName, millisToDays, truncDate, truncMonth, truncWeek} from "../../util/DateUtils.js";
import {createSubjectMap} from "../service/WanikaniDataUtil.js";
import ToolTipLabel from "../../shared/ToolTipLabel.jsx";

const units = {
    days: {
        key: 'days',
        text: 'Days',
        trunc: truncDate
    },
    weeks: {
        key: 'weeks',
        text: 'Weeks',
        trunc: truncWeek
    },
    months: {
        key: 'months',
        text: 'Months',
        trunc: truncMonth
    },
};

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

function aggregateDate(rawData, daysToLookBack, unit) {
    const areDatesDifferent = (date1, date2) => unit.trunc(date1).getTime() != unit.trunc(date2).getTime();
    const startDate = unit.trunc(Date.now() - (1000 * 60 * 60 * 24 * (daysToLookBack - 1))).getTime();
    const dataForTimeRange = rawData.filter(data => new Date(data.review.data['created_at']).getTime() > startDate);

    // Make sure to DataPoints for days with no reviews, so there is a gap in the graph
    function fillInEmptyDaysIfNeeded(aggregatedDate, reviewDate) {
        const dayBeforeReview = addDays(truncDate(reviewDate), -1);
        let lastDataPoint = aggregatedDate[aggregatedDate.length - 1];
        while (lastDataPoint.date.getTime() < dayBeforeReview.getTime()) {
            aggregatedDate.push(new DataPoint(addDays(lastDataPoint.date, 1)));
            lastDataPoint = aggregatedDate[aggregatedDate.length - 1];
        }
    }

    let aggregatedDate = [new DataPoint(truncDate(dataForTimeRange[0].review.data['created_at']))];
    for (const data of dataForTimeRange) {
        if (areDatesDifferent(aggregatedDate[aggregatedDate.length - 1].date, data.review.data['created_at'])) {
            fillInEmptyDaysIfNeeded(aggregatedDate, data.review.data['created_at']);
            aggregatedDate.push(new DataPoint(unit.trunc(data.review.data['created_at'])));
        }

        aggregatedDate[aggregatedDate.length - 1].push(data);
    }

    return aggregatedDate;
}

function getTotalDays() {
    const firstDate = truncDate(new Date(2000,0,1));
    const today = truncDate(Date.now());
    const difference = today.getTime() - firstDate.getTime();
    return millisToDays(difference);
}

function calculateLabelPositions(data) {
    const numberOfLabels = data.length == 7 ? 7 : 6
    return getVisibleLabelIndices(data, numberOfLabels);
}

function UnitSelector({options, unit, onChange}) {
    return (
        <Select
            style={{minWidth: '130px'}}
            size={'small'}
            value={unit.key}
            onChange={e => onChange(options.find(o => o.key === e.target.value))}
        >
            {options.map((option) => (
                <MenuItem key={option.key}
                          value={option.key}
                >
                    {option.text}
                </MenuItem>
            ))}
        </Select>
    );
}

const totalDays = getTotalDays();

function WanikaniReviewsHistoryChart() {
    const [rawData, setRawData] = useState([]);
    const [daysToLookBack, setDaysToLookBack] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [tooltipTargetItem, setTooltipTargetItem] = useState();
    const [unit, setUnit] = useState(units.days);

    useEffect(() => {
        setIsLoading(true);
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
                setIsLoading(false);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, []);

    const chartData = useMemo(() => rawData.length == 0 ? [] :
        aggregateDate(rawData, daysToLookBack, unit), [rawData, daysToLookBack, unit])

    const ReviewsToolTip = useMemo(() => {
        function getDateLabelText(date) {
            if (unit.key === units.days.key)
                return date.toLocaleDateString()
            else if (unit.key === units.weeks.key)
                return date.toLocaleDateString()
            else if (unit.key === units.months.key)
                return `${getMonthName(date, true)} ${date.getFullYear()}`
        }

        return function ReviewsToolTip({targetItem}) {
            const data = chartData[targetItem.point];
            return (
                <>
                    <ToolTipLabel title="Date" value={getDateLabelText(data.date)}/>
                    <br/>
                    <ToolTipLabel title="Total" value={data.total}/>
                    <ToolTipLabel title="Radicals" value={data.radicals}/>
                    <ToolTipLabel title="Kanji" value={data.kanji}/>
                    <ToolTipLabel title="Vocabulary" value={data.vocabulary}/>
                </>
            );
        }
    }, [chartData, unit]);


    const LabelWithDate = useMemo(() => {
        const visibleLabelIndices = calculateLabelPositions(chartData);

        return function LabelWithDate(props) {
            const date = props.text;
            if (!date) {
                return (<></>);
            }

            const index = chartData.findIndex(d => d.date === date);

            if (!visibleLabelIndices.includes(index)) {
                return (<></>);
            }

            return (
                <ArgumentAxis.Label
                    {...props}
                    text={new Date(date).toLocaleDateString()}
                />
            );
        }
    }, [chartData])

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <UnitSelector
                                options={[
                                    units.days,
                                    units.weeks,
                                    units.months
                                ]}
                                unit={unit}
                                onChange={setUnit}
                            />
                        </Grid>
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
                                    color={WanikaniColors.blue}
                                />

                                <BarSeries
                                    name="kanji"
                                    valueField="kanji"
                                    argumentField="date"
                                    color={WanikaniColors.pink}
                                />

                                <BarSeries
                                    name="vocabulary"
                                    valueField="vocabulary"
                                    argumentField="date"
                                    color={WanikaniColors.purple}
                                />

                                <Stack
                                    stacks={[{series: ['radicals', 'kanji', 'vocabulary']}]}
                                />

                                <EventTracker/>
                                <Tooltip
                                    targetItem={tooltipTargetItem ? {...tooltipTargetItem, series: 'vocabulary'} : null}
                                    onTargetItemChange={setTooltipTargetItem}
                                    contentComponent={ReviewsToolTip}
                                />
                            </Chart>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniReviewsHistoryChart;
