import { Card, CardContent, GridLegacy, Tooltip as MuiTooltip, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import React, { useMemo } from "react";
import { createSubjectMap } from "../service/WanikaniDataUtil";
import { addDays, truncDate, truncMonth, truncWeek } from "../../util/DateUtils";
import { ArgumentAxis, Chart, Tooltip, ValueAxis } from "@devexpress/dx-react-chart-material-ui";
import {
    AreaSeries,
    ArgumentAxis as ArgumentAxisBase,
    ArgumentScale,
    EventTracker,
    Stack,
    Tooltip as TooltipBase
} from "@devexpress/dx-react-chart";
import { WANIKANI_COLORS } from "../../Constants";
import ToolTipLabel from "../../shared/ToolTipLabel";
import { getVisibleLabelIndices, scaleBand } from "../../util/ChartUtils";
import { WanikaniReset } from "../models/WanikaniReset";
import Area from "../../shared/Area";
import { WanikaniSubject } from "../models/WanikaniSubject";
import { WanikaniAssignment } from "../models/WanikaniAssignment";
import { ErrorBoundary } from "react-error-boundary";
import { GenericErrorMessage } from "../../shared/GenericErrorMessage";
import { useDeviceInfo } from "../../hooks/useDeviceInfo";


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

type StageName = 'apprentice' | 'guru' | 'master' | 'enlightened' | 'burned';
type StageItemKey = 'apprenticeItems' | 'guruItems' | 'masterItems' | 'enlightenedItems' | 'burnedItems'

type StageChange = {
    date: Date
    startingSrsStage: number
    endingSrsStage: number
    subject: WanikaniSubject
};

// Seconds until the next review after reaching each stage (default SRS system).
// The accelerated system only differs on apprentice stages, by a few hours.
const SRS_INTERVALS: { [stage: number]: number } = {
    1: 14400, 2: 28800, 3: 82800, 4: 169200, 5: 601200, 6: 1206000, 7: 2588400, 8: 10364400,
};

class DataPoint {
    apprentice: number = 0
    guru: number = 0
    master: number = 0
    enlightened: number = 0
    burned: number = 0
    apprenticeItems: SubjectMap = {}
    guruItems: SubjectMap = {}
    masterItems: SubjectMap = {}
    enlightenedItems: SubjectMap = {}
    burnedItems: SubjectMap = {}

    constructor(
        public date: Date,
        previousDataPoint?: DataPoint
    ) {
        if (previousDataPoint) {
            this.apprentice = previousDataPoint.apprentice;
            this.guru = previousDataPoint.guru;
            this.master = previousDataPoint.master;
            this.enlightened = previousDataPoint.enlightened;
            this.burned = previousDataPoint.burned;
            this.apprenticeItems = previousDataPoint.apprenticeItems;
            this.guruItems = previousDataPoint.guruItems;
            this.masterItems = previousDataPoint.masterItems;
            this.enlightenedItems = previousDataPoint.enlightenedItems;
            this.burnedItems = previousDataPoint.burnedItems;
        }
    }

    #isApprentice(stage: number) {
        return [1, 2, 3, 4].includes(stage);
    }

    #isGuru(stage: number) {
        return [5, 6].includes(stage);
    }

    #isMaster(stage: number) {
        return [7].includes(stage);
    }

    #isEnlightened(stage: number) {
        return [8].includes(stage);
    }

    #isBurned(stage: number) {
        return [9].includes(stage);
    }

    #decrement(stage: number, subject: WanikaniSubject) {
        if (stage === 0) {
            return;
        }

        if (this.#isApprentice(stage)) {
            if (this.apprenticeItems[subject.id]) {
                this['apprentice'] -= 1;
                delete this.apprenticeItems[subject.id];
            }
        } else if (this.#isGuru(stage)) {
            if (this.guruItems[subject.id]) {
                this['guru'] -= 1;
                delete this.guruItems[subject.id];
            }
        } else if (this.#isMaster(stage)) {
            if (this.masterItems[subject.id]) {
                this['master'] -= 1;
                delete this.masterItems[subject.id];
            }
        } else if (this.#isEnlightened(stage)) {
            if (this.enlightenedItems[subject.id]) {
                this['enlightened'] -= 1;
                delete this.enlightenedItems[subject.id];
            }
        } else if (this.#isBurned(stage)) {
            if (this.burnedItems[subject.id]) {
                this['burned'] -= 1;
                delete this.burnedItems[subject.id];
            }
        }
    }

    #increment(stage: number, subject: WanikaniSubject) {
        if (this.#isApprentice(stage)) {
            if (!this.apprenticeItems[subject.id]) {
                this['apprentice'] += 1;
                this.apprenticeItems[subject.id] = subject;
            }
        } else if (this.#isGuru(stage)) {
            if (!this.guruItems[subject.id]) {
                this['guru'] += 1;
                this.guruItems[subject.id] = subject;
            }
        } else if (this.#isMaster(stage)) {
            if (!this.masterItems[subject.id]) {
                this['master'] += 1;
                this.masterItems[subject.id] = subject;
            }
        } else if (this.#isEnlightened(stage)) {
            if (!this.enlightenedItems[subject.id]) {
                this['enlightened'] += 1;
                this.enlightenedItems[subject.id] = subject;
            }
        } else if (this.#isBurned(stage)) {
            if (!this.burnedItems[subject.id]) {
                this['burned'] += 1;
                this.burnedItems[subject.id] = subject;
            }
        }
    }

    #areSameStage(stage1: number, stage2: number) {
        return (
            (this.#isApprentice(stage1) && this.#isApprentice(stage2)) ||
            (this.#isGuru(stage1) && this.#isGuru(stage2)) ||
            (this.#isMaster(stage1) && this.#isMaster(stage2)) ||
            (this.#isEnlightened(stage1) && this.#isEnlightened(stage2)) ||
            (this.#isBurned(stage1) && this.#isBurned(stage2))
        );
    }

    #resetStage(stageKey: StageName, stageItemsKey: StageItemKey, targetLevel: number) {
        for (const [key, subject] of Object.entries(this[stageItemsKey])) {
            if ((subject as WanikaniSubject).level >= targetLevel) {
                delete this[stageItemsKey][key];
            }
        }
        this[stageKey] = Object.keys(this[stageItemsKey]).length;
    }

    push(data: StageChange) {
        const startingStage = data.startingSrsStage;
        const endingStage = data.endingSrsStage;

        if (this.#areSameStage(startingStage, endingStage)) {
            return; // Do nothing, the stage didn't change
        }

        if (!data.subject) {
            return; // Could not find subject (most likely a new subject and the cache is stale)
        }

        this.#decrement(startingStage, data.subject);
        this.#increment(endingStage, data.subject);
    }

    reset(reset: WanikaniReset) {
        this.#resetStage('apprentice', 'apprenticeItems', reset.targetLevel);
        this.#resetStage('guru', 'guruItems', reset.targetLevel);
        this.#resetStage('master', 'masterItems', reset.targetLevel);
        this.#resetStage('enlightened', 'enlightenedItems', reset.targetLevel);
        this.#resetStage('burned', 'burnedItems', reset.targetLevel);
    }
}

// Reviews are no longer available, so stage changes are rebuilt from assignment timestamps.
// Start, pass, burn and the current stage are exact. Master and enlightened are estimated.
function getStageChanges(assignment: WanikaniAssignment, subject: WanikaniSubject): StageChange[] {
    const changes: StageChange[] = [];
    if (!assignment.startedAt) {
        return changes;
    }

    let stage = 0;
    let lastTime = 0;
    const moveTo = (endingSrsStage: number, time: number) => {
        lastTime = Math.max(time, lastTime);
        changes.push({ date: new Date(lastTime), startingSrsStage: stage, endingSrsStage, subject });
        stage = endingSrsStage;
    };

    moveTo(1, assignment.startedAt.getTime());
    const passedAt = assignment.passedAt?.getTime();
    if (passedAt) {
        moveTo(5, passedAt);
    }

    if (assignment.burnedAt) {
        // The final climb to burned has no mistakes, so count back from the burn
        const enlightenedAt = assignment.burnedAt.getTime() - SRS_INTERVALS[8] * 1000;
        const masterAt = enlightenedAt - SRS_INTERVALS[7] * 1000;
        if (passedAt && masterAt > passedAt) {
            moveTo(7, masterAt);
        }
        if (passedAt && enlightenedAt > passedAt) {
            moveTo(8, enlightenedAt);
        }
        moveTo(9, assignment.burnedAt.getTime());
        if (assignment.resurrectedAt && assignment.srsStage !== 9) {
            moveTo(assignment.srsStage, assignment.resurrectedAt.getTime());
        }
    } else if (assignment.availableAt && SRS_INTERVALS[assignment.srsStage]) {
        // The next review is scheduled from the last one, which dates the current stage
        const enteredAt = assignment.availableAt.getTime() - SRS_INTERVALS[assignment.srsStage] * 1000;
        const masterAt = enteredAt - SRS_INTERVALS[7] * 1000;
        if (assignment.srsStage === 8 && passedAt && masterAt > passedAt) {
            moveTo(7, masterAt);
        }
        moveTo(assignment.srsStage, enteredAt);
    }

    return changes;
}

function formatData(subjects: WanikaniSubject[], assignments: WanikaniAssignment[]) {
    const subjectMap = createSubjectMap(subjects);
    return assignments
        .filter(assignment => !!subjectMap[assignment.subjectId])
        .flatMap(assignment => getStageChanges(assignment, subjectMap[assignment.subjectId]))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function aggregateDate(rawData: StageChange[] | null, resets: WanikaniReset[], unit: StageHistoryUnit) {
    if (!rawData || rawData.length === 0)
        return [];
    const areDatesDifferent = (date1: Date | number, date2: Date | number) => unit.trunc(date1).getTime() != unit.trunc(date2).getTime();

    // Make sure to DataPoints for days with no reviews, so there is a gap in the graph
    function fillInEmptyDaysIfNeeded(aggregatedData: DataPoint[], reviewDate: Date) {
        const dayBeforeReview = addDays(truncDate(reviewDate), -1);
        let lastDataPoint = aggregatedData[aggregatedData.length - 1];
        while (lastDataPoint.date.getTime() < dayBeforeReview.getTime()) {
            aggregatedData.push(new DataPoint(addDays(lastDataPoint.date, 1), lastDataPoint));
            lastDataPoint = aggregatedData[aggregatedData.length - 1];
        }
    }

    const aggregatedData: DataPoint[] = [new DataPoint(truncDate(rawData[0].date))];
    let nextReset = resets[0];
    for (const data of rawData) {

        // Handle Resets by remove items and reset counts for levels higher than the reset target level
        if (nextReset && nextReset.confirmedAt.getTime() < data.date.getTime()) {
            if (areDatesDifferent(aggregatedData[aggregatedData.length - 1].date, nextReset.confirmedAt.getTime())) {
                fillInEmptyDaysIfNeeded(aggregatedData, nextReset.confirmedAt);
                aggregatedData.push(new DataPoint(unit.trunc(nextReset.confirmedAt), aggregatedData[aggregatedData.length - 1]));
            }

            aggregatedData[aggregatedData.length - 1].reset(nextReset);

            resets.splice(0, 1);
            nextReset = resets[0];
        }

        // Add new DataPoints for each day
        if (areDatesDifferent(aggregatedData[aggregatedData.length - 1].date, data.date)) {
            fillInEmptyDaysIfNeeded(aggregatedData, data.date);
            aggregatedData.push(new DataPoint(unit.trunc(data.date), aggregatedData[aggregatedData.length - 1]));
        }

        // Add the data to the current day/DataPoint
        aggregatedData[aggregatedData.length - 1].push(data);
    }

    return aggregatedData;
}

function useData(subjects: WanikaniSubject[], assignments: WanikaniAssignment[], resets: WanikaniReset[]) {
    return useMemo(() => aggregateDate(formatData(subjects, assignments), resets, units.days), [subjects, assignments, resets]);
}

type WanikaniStagesHistoryChartProps = {
    assignments: WanikaniAssignment[]
    resets: WanikaniReset[]
    subjects: WanikaniSubject[]
};

function WanikaniStagesHistoryChart({ subjects, assignments, resets }: WanikaniStagesHistoryChartProps) {
    const data = useData(subjects, assignments, resets);
    const { isMobile } = useDeviceInfo();

    const visibleLabelIndices = useMemo(() => getVisibleLabelIndices(data ?? [], isMobile ? 3 : 6), [data]);

    const StageToolTip = useMemo(() => (
        function StageToolTip(props: TooltipBase.ContentProps) {
            if (!data)
                return null;

            const dp = data[props.targetItem.point];
            return (
                <>
                    {dp.date.toLocaleDateString()}
                    <ToolTipLabel title="Apprentice" value={dp.apprentice} />
                    <ToolTipLabel title="Guru" value={dp.guru} />
                    <ToolTipLabel title="Master" value={dp.master} />
                    <ToolTipLabel title="Enlightened" value={dp.enlightened} />
                    <ToolTipLabel title="Burned" value={dp.burned} />
                </>
            );
        }
    ), [data]);

    const LabelWithDate = useMemo(() => (
        function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
            const date = new Date(props.text);
            if (!date || !data) {
                return null;
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

                <GridLegacy container>
                    <GridLegacy item xs={12} md={4} />
                    <GridLegacy item xs={12} md={4}>
                        <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                            Stage History
                        </Typography>
                    </GridLegacy>
                    <GridLegacy item xs={12} md={4} style={{ textAlign: 'right' }}>
                        <MuiTooltip title={'Master and Enlightened dates are estimated'}>
                            <InfoOutlined fontSize={'small'} />
                        </MuiTooltip>
                    </GridLegacy>
                </GridLegacy>

                <div style={{ flexGrow: '1' }}>
                    <Chart data={data}>
                        <ArgumentScale factory={scaleBand} />
                        <ArgumentAxis labelComponent={LabelWithDate} showTicks={false} />
                        <ValueAxis />

                        <AreaSeries
                            name="Apprentice"
                            valueField="apprentice"
                            argumentField="date"
                            color={WANIKANI_COLORS.pink}
                            seriesComponent={Area}
                        />

                        <AreaSeries
                            name="Guru"
                            valueField="guru"
                            argumentField="date"
                            color={WANIKANI_COLORS.purple}
                            seriesComponent={Area}
                        />

                        <AreaSeries
                            name="Master"
                            valueField="master"
                            argumentField="date"
                            color={WANIKANI_COLORS.masterBlue}
                            seriesComponent={Area}
                        />

                        <AreaSeries
                            name="Enlightened"
                            valueField="enlightened"
                            argumentField="date"
                            color={WANIKANI_COLORS.enlightenedBlue}
                            seriesComponent={Area}
                        />


                        <AreaSeries
                            name="Burned"
                            valueField="burned"
                            argumentField="date"
                            color={WANIKANI_COLORS.burnedGray}
                            seriesComponent={Area}
                        />

                        <Stack
                            stacks={[{
                                series: ['Apprentice', 'Guru', 'Master', 'Enlightened', 'Burned']
                            }]}
                        />

                        <EventTracker />
                        <Tooltip contentComponent={StageToolTip} />
                    </Chart>
                </div>
            </CardContent>
        </Card>
    );
}

// Wrapper to catch any errors
function WanikaniStagesHistoryChartErrorWrapper(props: WanikaniStagesHistoryChartProps) {
    return (
        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
            <WanikaniStagesHistoryChart {...props} />
        </ErrorBoundary>
    );
}

export default WanikaniStagesHistoryChartErrorWrapper;
