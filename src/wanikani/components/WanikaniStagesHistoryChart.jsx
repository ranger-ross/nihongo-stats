import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {createSubjectMap} from "../service/WanikaniDataUtil.js";
import {addDays, truncDate, truncMonth, truncWeek} from "../../util/DateUtils.js";
import {ArgumentAxis, Chart, Tooltip, ValueAxis} from "@devexpress/dx-react-chart-material-ui";
import {AreaSeries, ArgumentScale, EventTracker, Stack} from "@devexpress/dx-react-chart";
import {WanikaniColors} from "../../Constants.js";
import {area, curveCatmullRom,} from 'd3-shape';
import {scaleBand} from 'd3-scale';
import ToolTipLabel from "../../shared/ToolTipLabel.jsx";
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";


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

function aggregateDate(rawData, unit) {
    if (!rawData)
        return null;
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

    let aggregatedDate = [new DataPoint(truncDate(rawData[0].review.data['created_at']))];
    for (const data of rawData) {
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


    const data = useMemo(() => aggregateDate(state.data, units.days), [state.data]);

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
    const [tooltipTargetItem, setTooltipTargetItem] = useState();

    const visibleLabelIndices = useMemo(() => getVisibleLabelIndices(data ?? [], 6), [data]);

    const StageToolTip = useMemo(() => (
        function StageToolTip(props) {
            const dp = data[props.targetItem.point];
            return (
                <>
                    {dp.date.toLocaleDateString()}
                    <ToolTipLabel title="Apprentice" value={dp.apprentice}/>
                    <ToolTipLabel title="Guru" value={dp.guru}/>
                    <ToolTipLabel title="Master" value={dp.master}/>
                    <ToolTipLabel title="Enlightened" value={dp.enlightened}/>
                    <ToolTipLabel title="Burned" value={dp.burned}/>
                </>
            );
        }
    ), [data]);

    const LabelWithDate = useMemo(() => (
        function LabelWithDate(props) {
            const date = new Date(props.text);
            if (!date) {
                return (<></>)
            }

            const index = data.findIndex(dp => dp.date.getTime() === date.getTime());
            const isVisible = visibleLabelIndices.includes(index);

            return (
                <>
                    {isVisible ? (
                        <ArgumentAxis.Label
                            {...props}
                            text={new Date(date).toLocaleDateString()}
                        />
                    ) : null}
                </>
            );
        }
    ), [visibleLabelIndices]);

    return (
        <Card>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}/>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            Stage History
                        </Typography>
                    </Grid>
                </Grid>

                {isLoading ? (
                    <Grid item container xs={12} justifyContent={'center'} style={{padding: '10px'}}>
                        <CircularProgress/>
                    </Grid>
                ) : (
                    <div style={{flexGrow: '1'}}>
                        <Chart data={data}>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false}/>
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
                                    series: ['Apprentice', 'Guru', 'Master', 'Enlightened', 'Burned']
                                }]}
                            />

                            <EventTracker/>
                            <Tooltip
                                targetItem={tooltipTargetItem}
                                onTargetItemChange={setTooltipTargetItem}
                                contentComponent={StageToolTip}
                            />
                        </Chart>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default WanikaniStagesHistoryChart;
