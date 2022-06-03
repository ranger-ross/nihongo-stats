import * as React from 'react';
import {useEffect, useState} from 'react';
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
import AnkiApiService from "../service/AnkiApiService";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import {truncDate} from "../../util/DateUtils";
import {getVisibleLabelIndices, scaleBand} from "../../util/ChartUtils";
import PeriodSelector from "../../shared/PeriodSelector";
import {createAnkiCardsDueQuery} from "../service/AnkiDataUtil";

type DataPoint = any;

function dataPoint(day: number): DataPoint {
    const data: DataPoint = {
        day,
        date: truncDate(Date.now() + (1000 * 60 * 60 * 24 * day))
    };

    data.addDueCards = (deck: string, cards: any[]) => {
        data[deck] = cards.length;
    };

    return data;
}

async function fetchData(decks: string[], numberOfDays: number): Promise<DataPoint[]> {
    const actions = [];
    for (let i = 0; i < numberOfDays; i++) {
        for (const deck of decks) {
            actions.push(createAnkiCardsDueQuery(deck, i));
        }
    }

    const listOfListDueCards = await AnkiApiService.sendMultiRequest(actions);

    const data = [dataPoint(0)];
    for (let i = 0; i < listOfListDueCards.length; i++) {
        if (i % decks.length === 0 && i != 0) {
            data.push(dataPoint(data[data.length - 1].day + 1));
        }
        const dp = data[data.length - 1];
        const deck = decks[i % decks.length];
        dp.addDueCards(deck, listOfListDueCards[i]);
    }
    return data;
}

type ChartData = { data: DataPoint[], decks: string[]}

function AnkiUpcomingReviewsChart() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [days, setDays] = useState(14);
    const [chartData, setChartData] = useState<ChartData>();

    useEffect(() => {
        let isSubscribed = true;

        if (!selectedDecks || selectedDecks.length === 0)
            return;

        if (selectedDecks?.length != chartData?.decks?.length) {
            setChartData(undefined);
        }

        fetchData(selectedDecks, days)
            .then(data => {
                if (!isSubscribed)
                    return;
                setChartData({
                    data: data,
                    decks: selectedDecks
                });
            });
        return () => {
            isSubscribed = false;
        };
    }, [selectedDecks, days]);

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


                {!chartData ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    // @ts-ignore
                    <Chart data={(chartData as ChartData).data} height={800}>
                        <ArgumentScale factory={scaleBand}/>
                        <ArgumentAxis labelComponent={LabelWithDate}/>
                        <ValueAxis/>

                        {(chartData as ChartData).decks?.map(deck => (
                            <BarSeries
                                key={deck}
                                name={deck}
                                argumentField="date"
                                valueField={deck}
                            />
                        ))}

                        <Stack
                            stacks={[{series: (chartData as ChartData).decks}]}
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
