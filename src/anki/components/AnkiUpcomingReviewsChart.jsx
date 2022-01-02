import * as React from 'react';
import {
    Chart, Legend, Tooltip, ValueAxis, ArgumentAxis,
} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {Animation, ArgumentScale, BarSeries, EventTracker, Stack} from "@devexpress/dx-react-chart";
import AnkiApiService from "../service/AnkiApiService.js";
import {scaleBand} from 'd3-scale';
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.jsx";
import {truncDate} from "../../util/DateUtils.js";
import {getVisibleLabelIndices} from "../../util/ChartUtils.js";
import DaysSelector from "../../shared/DaysSelector.jsx";
import {createAnkiCardsDueQuery} from "../service/AnkiDataUtil.js";

function DataPoint(day) {
    let data = {
        day,
        date: truncDate(Date.now() + (1000 * 60 * 60 * 24 * day))
    };

    data.addDueCards = (deck, cards) => {
        data[deck] = cards.length;
    };

    return data;
}

async function fetchData(decks, numberOfDays) {
    let actions = [];
    for (let i = 0; i < numberOfDays; i++) {
        for (const deck of decks) {
            actions.push(createAnkiCardsDueQuery(deck, i));
        }
    }

    const listOfListDueCards = await AnkiApiService.sendMultiRequest(actions);

    let data = [new DataPoint(0)];
    for (let i = 0; i < listOfListDueCards.length; i++) {
        if (i % decks.length === 0 && i != 0) {
            data.push(new DataPoint(data[data.length - 1].day + 1));
        }
        const dp = data[data.length - 1];
        const deck = decks[i % decks.length];
        dp.addDueCards(deck, listOfListDueCards[i]);
    }
    return data;
}

function AnkiUpcomingReviewsChart() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [days, setDays] = useState(14);
    const [chartData, setChartData] = useState();

    useEffect(() => {
        let isSubscribed = true;

        if (!selectedDecks || selectedDecks.length === 0)
            return;

        if (selectedDecks?.length != chartData?.decks?.length) {
            setChartData(null);
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
        return () => isSubscribed = false;
    }, [selectedDecks, days]);

    const visibleLabelIndices = getVisibleLabelIndices(chartData?.data ?? [], 20);

    const LabelWithDate = (props) => {
        const dateAsString = props.text;
        if (!dateAsString) {
            return (<></>);
        }
        const date = new Date(dateAsString)
        const index = chartData.data.findIndex(d => d.date.getTime() === date.getTime());
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
        const data = chartData.data[targetItem.point];
        return (
            <>
                <p>Date: {data.date.toLocaleDateString()}</p>
                {chartData.decks.map(deck => (
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
                        <DaysSelector
                            options={[
                                {value: 7, text: '7' },
                                {value: 14, text: '14' },
                                {value: 30, text: '30' },
                                {value: 60, text: '60' },
                                {value: 90, text: '90' },
                            ]}
                            days={days}
                            setDays={setDays}
                        />
                    </Grid>

                </Grid>


                {!chartData ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    <Chart data={chartData.data} height={800}>
                        <ArgumentScale factory={scaleBand}/>
                        <ArgumentAxis labelComponent={LabelWithDate}/>
                        <ValueAxis/>

                        {chartData.decks?.map(deck => (
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