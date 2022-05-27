import {Card, CardContent, CircularProgress, Grid} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {createSubjectMap} from "../service/WanikaniDataUtil.js";
import {addDays, truncDate, truncMonth, truncWeek} from "../../util/DateUtils.js";
import {Chart, ValueAxis} from "@devexpress/dx-react-chart-material-ui";
import {AreaSeries, ArgumentScale, Stack} from "@devexpress/dx-react-chart";
import {WanikaniColors} from "../../Constants.js";
import {area, curveCatmullRom,} from 'd3-shape';
import {scaleBand} from 'd3-scale';


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

function DataPoint(date, previousDataPoint = {}) {
    let data = {
        apprentice: 0,
        guru: 0,
        master: 0,
        enlightened: 0,
        burned: 0,

        ...previousDataPoint,
        date: date,
    };

    function isApprentice(stage) {
        return [2, 3, 4].includes(stage);
    }

    function isGuru(stage) {
        return [5, 6].includes(stage);
    }

    function isMaster(stage) {
        return [7].includes(stage);
    }

    function isEnlightened(stage) {
        return [8].includes(stage);
    }

    function isBurned(stage) {
        return [9].includes(stage);
    }

    function decrement(stage) {
        if (stage === 0) {
            return;
        }

        if (isApprentice(stage)) {
            data['apprentice'] -= 1;
        } else if (isGuru(stage)) {
            data['guru'] -= 1;
        } else if (isMaster(stage)) {
            data['master'] -= 1;
        } else if (isEnlightened(stage)) {
            data['enlightened'] -= 1;
        } else if (isBurned(stage)) {
            data['burned'] -= 1;
        }
    }

    function increment(stage) {
        if (isApprentice(stage)) {
            data['apprentice'] += 1;
        } else if (isGuru(stage)) {
            data['guru'] += 1;
        } else if (isMaster(stage)) {
            data['master'] += 1;
        } else if (isEnlightened(stage)) {
            data['enlightened'] += 1;
        } else if (isBurned(stage)) {
            data['burned'] += 1;
        }
    }

    function areSameStage(stage1, stage2) {
        return (
            (isApprentice(stage1) && isApprentice(stage2)) ||
            (isGuru(stage1) && isGuru(stage2)) ||
            (isMaster(stage1) && isMaster(stage2)) ||
            (isEnlightened(stage1) && isEnlightened(stage2)) ||
            (isBurned(stage1) && isBurned(stage2))
        );
    }

    data.push = (d) => {
        const startingStage = d.review.data['starting_srs_stage'];
        const endingStage = d.review.data['ending_srs_stage'];

        if (areSameStage(startingStage, endingStage)) {
            return; // Do nothing, the stage didn't change
        }

        decrement(startingStage);
        increment(endingStage)
    };

    return data;
}

async function getSrsSystemMap() {
    const srsSystems = await WanikaniApiService.getSrsSystems();

    let srsSystemMap = {};
    for (const system of srsSystems.data) {
        srsSystemMap[system.id] = system;
    }
    return srsSystemMap;
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

    const srsSystems = await getSrsSystemMap();

    return {
        data,
        srsSystems,
    };
}

function aggregateDate(rawData, daysToLookBack, unit) {
    if (!rawData)
        return null;
    const {data, srsSystems} = rawData;
    const areDatesDifferent = (date1, date2) => unit.trunc(date1).getTime() != unit.trunc(date2).getTime();

    // Make sure to DataPoints for days with no reviews, so there is a gap in the graph
    function fillInEmptyDaysIfNeeded(aggregatedDate, reviewDate) {
        const dayBeforeReview = addDays(truncDate(reviewDate), -1);
        let lastDataPoint = aggregatedDate[aggregatedDate.length - 1];
        while (lastDataPoint.date.getTime() < dayBeforeReview.getTime()) {
            aggregatedDate.push(new DataPoint(addDays(lastDataPoint.date, 1), lastDataPoint));
            lastDataPoint = aggregatedDate[aggregatedDate.length - 1];
        }
    }

    let aggregatedDate = [new DataPoint(truncDate(rawData.data[0].review.data['created_at']))];
    for (const data of rawData.data) {
        if (areDatesDifferent(aggregatedDate[aggregatedDate.length - 1].date, data.review.data['created_at'])) {
            fillInEmptyDaysIfNeeded(aggregatedDate, data.review.data['created_at']);
            aggregatedDate.push(new DataPoint(unit.trunc(data.review.data['created_at']), aggregatedDate[aggregatedDate.length - 1]));
        }

        aggregatedDate[aggregatedDate.length - 1].push(data);
    }

    return aggregatedDate;
}


function useData() {
    const [state, setState] = useState({
        isLoading: true,
        data: null,
    });

    useEffect(() => {
        let isSubscribed = true;

        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setState({
                    data,
                    isLoading: false
                });
            });

        return () => isSubscribed = false;
    }, []);


    const data = useMemo(() => aggregateDate(state.data, 100000, units.days), [state.data]);

    return [data, state.isLoading];
}

function Area(props) {
    const {
        coordinates,
        color,
    } = props;

    return (
        <path
            fill={color}
            d={area()
                .x(({arg}) => arg)
                .y1(({val}) => val)
                .y0(({startVal}) => startVal)
                .curve(curveCatmullRom)(coordinates)}
            opacity={0.5}
        />
    );
}


function WanikaniStagesHistoryChart() {
    const [data, isLoading] = useData();

    console.log(data, isLoading);

    return (
        <Card>
            <CardContent>
                {isLoading ? (
                    <Grid item container xs={12} justifyContent={'center'} style={{padding: '10px'}}>
                        <CircularProgress/>
                    </Grid>
                ) : (
                    <div style={{flexGrow: '1'}}>
                        <Chart data={data}>
                            <ArgumentScale factory={scaleBand}/>
                            {/*<ArgumentAxis labelComponent={LabelWithDate}/>*/}
                            <ValueAxis/>


                            <AreaSeries
                                name="Apprentice"
                                valueField="apprentice"
                                argumentField="date"
                                color={WanikaniColors.pink}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Guru"
                                valueField="guru"
                                argumentField="date"
                                color={WanikaniColors.purple}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Master"
                                valueField="master"
                                argumentField="date"
                                color={WanikaniColors.masterBlue}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Enlightened"
                                valueField="enlightened"
                                argumentField="date"
                                color={WanikaniColors.enlightenedBlue}
                                seriesComponent={Area}
                            />


                            <AreaSeries
                                name="Burned"
                                valueField="burned"
                                argumentField="date"
                                color={WanikaniColors.burnedGray}
                                seriesComponent={Area}
                            />

                            <Stack
                                stacks={[{
                                    series: ['Apprentice', 'Guru', 'Master', 'Enlightened', 'Burned'],
                                }]}
                            />

                            {/*<EventTracker/>*/}
                            {/*<Tooltip*/}
                            {/*    targetItem={tooltipTargetItem ? {...tooltipTargetItem, series: 'vocabulary'} : null}*/}
                            {/*    onTargetItemChange={setTooltipTargetItem}*/}
                            {/*    contentComponent={ReviewsToolTip}*/}
                            {/*/>*/}
                        </Chart>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default WanikaniStagesHistoryChart;
