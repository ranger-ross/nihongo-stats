import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import {createSubjectMap} from "../service/WanikaniDataUtil";
import {addDays, truncDate, truncMonth, truncWeek} from "../../util/DateUtils";
import {ArgumentAxis, Chart, Tooltip, ValueAxis} from "@devexpress/dx-react-chart-material-ui";
import {
    AreaSeries,
    ArgumentAxis as ArgumentAxisBase,
    ArgumentScale,
    EventTracker,
    SeriesRef,
    Stack,
    Tooltip as TooltipBase
} from "@devexpress/dx-react-chart";
import {WanikaniColors} from "../../Constants";
import ToolTipLabel from "../../shared/ToolTipLabel";
import {getVisibleLabelIndices} from "../../util/ChartUtils";
import {WanikaniReset} from "../models/WanikaniReset";
import Area from "../../shared/Area";
import {scaleBand} from "../../util/ChartUtils";
import {WanikaniSubject} from "../models/WanikaniSubject";
import {WanikaniSubjectReview} from "../models/WanikaniSubjectReview";


type StageHistoryUnit = {
    key: string,
    text: string,
    trunc: (date: Date | number) => Date
};

const units: { [key: string]: StageHistoryUnit } = {
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

type SubjectMap = { [id: string]: WanikaniSubject };

type DataPoint = {
    date: Date,
    apprentice: number,
    guru: number,
    master: number,
    enlightened: number,
    burned: number,
    apprenticeItems: SubjectMap,
    guruItems: SubjectMap,
    masterItems: SubjectMap,
    enlightenedItems: SubjectMap,
    burnedItems: SubjectMap,
    push: (data: any) => void,
    reset: (reset: WanikaniReset) => void
};

function dataPoint(date: Date, previousDataPoint = {}) {
    const data: DataPoint = {
        // Keep Track of what subjects in what stage
        apprenticeItems: {},
        guruItems: {},
        masterItems: {},
        enlightenedItems: {},
        burnedItems: {},

        // Counts, used to keep runtime low.
        // Calling Object.keys().length on the lists above is slow
        apprentice: 0,
        guru: 0,
        master: 0,
        enlightened: 0,
        burned: 0,

        ...previousDataPoint, // Continue counts from previous day
        date: date,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reset: reset => {// TODO: fix dummy method, this is added to fix typing
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        push: data => {// TODO: fix dummy method, this is added to fix typing
        },
    };

    function isApprentice(stage: number) {
        return [2, 3, 4].includes(stage);
    }

    function isGuru(stage: number) {
        return [5, 6].includes(stage);
    }

    function isMaster(stage: number) {
        return [7].includes(stage);
    }

    function isEnlightened(stage: number) {
        return [8].includes(stage);
    }

    function isBurned(stage: number) {
        return [9].includes(stage);
    }

    function decrement(stage: number, subject: WanikaniSubject) {
        if (stage === 0) {
            return;
        }

        if (isApprentice(stage)) {
            if (data.apprenticeItems[subject.id]) {
                data['apprentice'] -= 1;
                delete data.apprenticeItems[subject.id];
            }
        } else if (isGuru(stage)) {
            if (data.guruItems[subject.id]) {
                data['guru'] -= 1;
                delete data.guruItems[subject.id];
            }
        } else if (isMaster(stage)) {
            if (data.masterItems[subject.id]) {
                data['master'] -= 1;
                delete data.masterItems[subject.id];
            }
        } else if (isEnlightened(stage)) {
            if (data.enlightenedItems[subject.id]) {
                data['enlightened'] -= 1;
                delete data.enlightenedItems[subject.id];
            }
        } else if (isBurned(stage)) {
            if (data.burnedItems[subject.id]) {
                data['burned'] -= 1;
                delete data.burnedItems[subject.id];
            }
        }
    }

    function increment(stage: number, subject: WanikaniSubject) {
        if (isApprentice(stage)) {
            if (!data.apprenticeItems[subject.id]) {
                data['apprentice'] += 1;
                data.apprenticeItems[subject.id] = subject;
            }
        } else if (isGuru(stage)) {
            if (!data.guruItems[subject.id]) {
                data['guru'] += 1;
                data.guruItems[subject.id] = subject;
            }
        } else if (isMaster(stage)) {
            if (!data.masterItems[subject.id]) {
                data['master'] += 1;
                data.masterItems[subject.id] = subject;
            }
        } else if (isEnlightened(stage)) {
            if (!data.enlightenedItems[subject.id]) {
                data['enlightened'] += 1;
                data.enlightenedItems[subject.id] = subject;
            }
        } else if (isBurned(stage)) {
            if (!data.burnedItems[subject.id]) {
                data['burned'] += 1;
                data.burnedItems[subject.id] = subject;
            }
        }
    }

    function areSameStage(stage1: number, stage2: number) {
        return (
            (isApprentice(stage1) && isApprentice(stage2)) ||
            (isGuru(stage1) && isGuru(stage2)) ||
            (isMaster(stage1) && isMaster(stage2)) ||
            (isEnlightened(stage1) && isEnlightened(stage2)) ||
            (isBurned(stage1) && isBurned(stage2))
        );
    }

    // Add a review, check the start/end stages and increment and decrement accordingly
    data.push = (d: WanikaniSubjectReview) => {
        const startingStage = d.review.startingSrsStage;
        const endingStage = d.review.endingSrsStage;

        if (areSameStage(startingStage, endingStage)) {
            return; // Do nothing, the stage didn't change
        }

        decrement(startingStage, d.subject);
        increment(endingStage, d.subject);

    };

    function resetStage(stageKey: string, stageItemsKey: string, targetLevel: number) {
        // @ts-ignore
        for (const [key, subject] of Object.entries(data[stageItemsKey])) {
            if ((subject as WanikaniSubject).level >= targetLevel) {
                // @ts-ignore
                delete data[stageItemsKey][key];
            }
        }
        // @ts-ignore
        data[stageKey] = Object.keys(data[stageItemsKey]).length;
    }

    // Remove items and reset counts for levels that have been reset
    data.reset = (reset: WanikaniReset) => {
        resetStage('apprentice', 'apprenticeItems', reset.targetLevel);
        resetStage('guru', 'guruItems', reset.targetLevel);
        resetStage('master', 'masterItems', reset.targetLevel);
        resetStage('enlightened', 'enlightenedItems', reset.targetLevel);
        resetStage('burned', 'burnedItems', reset.targetLevel);
    };

    return data;
}

async function fetchData() {
    const [reviews, resets] = await Promise.all([
        WanikaniApiService.getReviews(),
        WanikaniApiService.getResets(),
    ]);
    const subjects = createSubjectMap(await WanikaniApiService.getSubjects());
    const data: WanikaniSubjectReview[] = [];
    for (const review of reviews) {
        data.push({
            review: review,
            subject: subjects[review.subjectId]
        });
    }

    return {
        data: data,
        resets: resets
    };
}

function aggregateDate(rawData: WanikaniSubjectReview[] | null, resets: WanikaniReset[], unit: StageHistoryUnit) {
    if (!rawData)
        return null;
    const areDatesDifferent = (date1: Date | number, date2: Date | number) => unit.trunc(date1).getTime() != unit.trunc(date2).getTime();

    // Make sure to DataPoints for days with no reviews, so there is a gap in the graph
    function fillInEmptyDaysIfNeeded(aggregatedData: DataPoint[], reviewDate: Date) {
        const dayBeforeReview = addDays(truncDate(reviewDate), -1);
        let lastDataPoint = aggregatedData[aggregatedData.length - 1];
        while (lastDataPoint.date.getTime() < dayBeforeReview.getTime()) {
            aggregatedData.push(dataPoint(addDays(lastDataPoint.date, 1), lastDataPoint));
            lastDataPoint = aggregatedData[aggregatedData.length - 1];
        }
    }

    const aggregatedData: DataPoint[] = [dataPoint(truncDate(rawData[0].review.createdAt))];
    let nextReset = resets[0];
    for (const data of rawData) {

        // Handle Resets by remove items and reset counts for levels higher than the reset target level
        if (nextReset && nextReset.confirmedAt.getTime() < data.review.createdAt.getTime()) {
            if (areDatesDifferent(aggregatedData[aggregatedData.length - 1].date, nextReset.confirmedAt.getTime())) {
                fillInEmptyDaysIfNeeded(aggregatedData, nextReset.confirmedAt);
                aggregatedData.push(dataPoint(unit.trunc(nextReset.confirmedAt), aggregatedData[aggregatedData.length - 1]));
            }

            aggregatedData[aggregatedData.length - 1].reset(nextReset);

            resets.splice(0, 1);
            nextReset = resets[0];
        }

        // Add new DataPoints for each day
        if (areDatesDifferent(aggregatedData[aggregatedData.length - 1].date, data.review.createdAt)) {
            fillInEmptyDaysIfNeeded(aggregatedData, data.review.createdAt);
            aggregatedData.push(dataPoint(unit.trunc(data.review.createdAt), aggregatedData[aggregatedData.length - 1]));
        }

        // Add the data to the current day/DataPoint
        aggregatedData[aggregatedData.length - 1].push(data);
    }

    return aggregatedData;
}

type DataState = {
    isLoading: boolean,
    data: WanikaniSubjectReview[] | null,
    resets: WanikaniReset[],
};

function useData() {
    const [state, setState] = useState<DataState>({
        isLoading: true,
        data: null,
        resets: [],
    });

    useEffect(() => {
        let isSubscribed = true;

        fetchData()
            .then(({data, resets}) => {
                if (!isSubscribed)
                    return;
                setState({
                    data,
                    resets,
                    isLoading: false
                });
            });

        return () => {
            isSubscribed = false;
        };
    }, []);


    const data = useMemo(() => aggregateDate(state.data, state.resets, units.days), [state.data, state.resets]);

    return {
        data,
        isLoading: state.isLoading
    };
}


function WanikaniStagesHistoryChart() {
    const {data, isLoading} = useData();
    const [tooltipTargetItem, setTooltipTargetItem] = useState<SeriesRef>();

    const visibleLabelIndices = useMemo(() => getVisibleLabelIndices(data ?? [], 6), [data]);

    const StageToolTip = useMemo(() => (
        function StageToolTip(props: TooltipBase.ContentProps) {
            if (!data)
                return <></>
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
        function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
            const date = new Date(props.text);
            if (!date || !data) {
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
                        {/*@ts-ignore*/}
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
