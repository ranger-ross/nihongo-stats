import {useState} from 'react';
import {ArgumentAxis, Chart, Legend, Tooltip, ValueAxis,} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {
    Animation,
    ArgumentAxis as ArgumentAxisBase,
    ArgumentScale,
    BarSeries,
    EventTracker,
    Stack
} from "@devexpress/dx-react-chart";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import {UpcomingReviewDataPoint} from "../service/AnkiDataUtil";
import {useAnkiUpcomingReviews} from "../service/AnkiQueries";

type ChartData = { data: UpcomingReviewDataPoint[], decks: string[] }

function AnkiUpcomingReviewsChart() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [days, setDays] = useState(14);

    const {data, isLoading, error} = useAnkiUpcomingReviews(selectedDecks, days);

    error && console.error(error);

    // Create a key that is unique the selected decks.
    // If the selected decks change, without this key the React Chart will crash due to a bug.
    // This key will force the Chart element to be re-rendered a new component
    // https://github.com/DevExpress/devextreme-reactive/issues/3570
    const key = selectedDecks.reduce((a, c) => a + c, '');

    const chartData: ChartData = {
        data: data ?? [],
        decks: selectedDecks
    };

    const visibleLabelIndices = getVisibleLabelIndices(chartData?.data ?? [], 20);

    function LabelWithDate(props: ArgumentAxisBase.LabelProps) {
        const dateAsString = props.text;
        if (!dateAsString) {
            return (<></>);
        }
        const date = new Date(dateAsString)
        const index = (chartData as ChartData).data.findIndex(d => d.date.getTime() === date.getTime());
        if (!visibleLabelIndices.includes(index)) {
            return (<></>);
        }

        return (
            <ArgumentAxis.Label
                {...props}
                text={(date.getMonth() + 1) + '/' + (date.getDate())}
            />
        );
    }

    function ReviewsToolTip({targetItem}: Tooltip.ContentProps) {
        const data = (chartData as ChartData).data[targetItem.point];
        return (
            <>
                <p>Date: {data.date.toLocaleDateString()}</p>
                {(chartData as ChartData).decks.map(deck => (
                    <p key={deck}>{deck}: {data[deck]}</p>
                ))}
            </>
        );
    }

    return (
        <Card>
            <CardContent>
                <Grid container>
                    <Grid item xs={12} md={4}/>
                    <Grid item xs={12} md={4}>
                        <Typography variant={'h5'} style={{textAlign: 'center', paddingBottom: '5px'}}>
                            Upcoming Reviews
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4} style={{textAlign: 'end'}}>
                        <PeriodSelector
                            period={days}
                            setPeriod={setDays}
                            options={[
                                {value: 7, text: '7'},
                                {value: 14, text: '14'},
                                {value: 30, text: '30'},
                                {value: 60, text: '60'},
                                {value: 90, text: '90'},
                            ]}
                        />
                    </Grid>

                </Grid>


                {isLoading ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    // @ts-ignore
                    <Chart key={key} data={chartData.data} height={800}>
                        <ArgumentScale factory={scaleBand}/>
                        <ArgumentAxis labelComponent={LabelWithDate}/>
                        <ValueAxis/>

                        {chartData.decks.map(deck => (
                            <BarSeries
                                key={deck}
                                name={deck}
                                argumentField="date"
                                valueField={deck}
                            />
                        ))}

                        <Stack
                            stacks={[{series: chartData.decks}]}
                        />

                        <Animation/>
                        <Legend position="bottom"/>
                        <EventTracker/>
                        <Tooltip contentComponent={ReviewsToolTip}/>
                    </Chart>
                )}

            </CardContent>
        </Card>
    );
}

export default AnkiUpcomingReviewsChart;
