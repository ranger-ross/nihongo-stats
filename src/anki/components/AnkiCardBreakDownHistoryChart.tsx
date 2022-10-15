import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import PeriodSelector from "../../shared/PeriodSelector";
import {daysToMillis} from "../../util/DateUtils";
import {useMemo, useState} from "react";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis} from "@devexpress/dx-react-chart-material-ui";
import {AreaSeries, ArgumentScale, EventTracker, Stack, ValueAxis as ValueAxisBase} from "@devexpress/dx-react-chart";
import {ANKI_COLORS} from "../../Constants";
import ToolTipLabel from "../../shared/ToolTipLabel";
import Area from "../../shared/Area";
import {useAnkiBreakDownHistory} from "../service/AnkiQueries";

function useOptions() {
    return [
        {value: 30, text: '1 Mon'},
        {value: 60, text: '2 Mon'},
        {value: 90, text: '3 Mon'},
        {value: 180, text: '6 Mon'},
        {value: 365, text: '1 Yr'},
        {value: 10_000, text: 'All'},
    ];
}

type AnkiCardBreakDownHistoryChartProps = {
    deckNames: string[]
};

function AnkiCardBreakDownHistoryChart({deckNames}: AnkiCardBreakDownHistoryChartProps) {
    const [daysToLookBack, setDaysToLookBack] = useState(10_000);
    const {data, error, isLoading} = useAnkiBreakDownHistory(deckNames);
    const options = useOptions();

    error && console.log(error)

    const chartData = useMemo(() => (data ?? [])
            .filter(dp => new Date(dp.date).getTime() >= Date.now() - daysToMillis(daysToLookBack)),
        [data, daysToLookBack]);
    const visibleLabelIndices = getVisibleLabelIndices(chartData ?? [], 6);

    function StatsToolTip({targetItem}: Tooltip.ContentProps) {
        const dp = chartData[targetItem.point];
        return (
            <>
                <ToolTipLabel title="Date" value={new Date(dp.date).toLocaleDateString()}/>
                <ToolTipLabel title="New" value={dp.newCount}/>
                <ToolTipLabel title="Learning" value={dp.learningCount}/>
                <ToolTipLabel title="Relearning" value={dp.relearningCount}/>
                <ToolTipLabel title="Young" value={dp.youngCount}/>
                <ToolTipLabel title="Mature" value={dp.matureCount}/>
            </>
        );
    }

    function LabelWithDate(props: ValueAxisBase.LabelProps) {
        const date = new Date(props.text);
        if (!date) {
            return (<></>)
        }

        const index = chartData.findIndex(dp => dp.date === date.getTime());
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

    return (
        <Card>
            <CardContent>

                <Grid container>
                    <Grid item xs={12} md={4}/>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center'}}>
                            Card Breakdown History
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                        <PeriodSelector period={daysToLookBack}
                                        setPeriod={setDaysToLookBack}
                                        options={options}
                        />
                    </Grid>
                </Grid>

                {isLoading ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    !!deckNames && chartData ? (
                        <Chart data={chartData}>
                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate} showTicks={false}/>
                            <ValueAxis/>

                            <AreaSeries
                                name="Mature"
                                valueField="matureCount"
                                argumentField="date"
                                color={ANKI_COLORS.darkGreen}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Learning"
                                valueField="learningCount"
                                argumentField="date"
                                color={ANKI_COLORS.lightOrange}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Relearning"
                                valueField="relearningCount"
                                argumentField="date"
                                color={ANKI_COLORS.redOrange}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="Young"
                                valueField="youngCount"
                                argumentField="date"
                                color={ANKI_COLORS.lightGreen}
                                seriesComponent={Area}
                            />

                            <AreaSeries
                                name="New"
                                valueField="newCount"
                                argumentField="date"
                                color={ANKI_COLORS.blue}
                                seriesComponent={Area}
                            />

                            <Stack
                                stacks={[{
                                    series: ['New', 'Learning', 'Relearning', 'Young', 'Mature'],
                                }]}
                            />

                            <Legend/>
                            <EventTracker/>
                            <Tooltip contentComponent={StatsToolTip}/>
                        </Chart>
                    ) : null
                )}

            </CardContent>
        </Card>
    );
}

export default AnkiCardBreakDownHistoryChart;
