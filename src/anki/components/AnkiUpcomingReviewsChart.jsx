import * as React from 'react';
import {
    Chart, Legend, Tooltip, ValueAxis, ArgumentAxis,
} from '@devexpress/dx-react-chart-material-ui';
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {ArgumentScale, BarSeries, EventTracker, LineSeries, Stack} from "@devexpress/dx-react-chart";
import AnkiApiService from "../service/AnkiApiService.js";
import {scaleBand} from 'd3-scale';
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.jsx";
import {truncDate} from "../../util/DateUtils.js";

function createParams(deck, day) {
    return {
        "action": "findCards",
        "params": {
            "query": `deck:"${deck}" prop:due=${day}`
        }
    };
}

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
            actions.push(createParams(deck, i));
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
    const [chartData, setChartData] = useState();

    useEffect(() => {
        let isSubscribed = true;

        if (!selectedDecks || selectedDecks.length === 0)
            return;

        fetchData(selectedDecks, 10)
            .then(data => {
                if (!isSubscribed)
                    return;
                setChartData(data);
            });
        return () => isSubscribed = false;
    }, [selectedDecks]);

    console.log(chartData);

    return (
        <Card>
            <CardContent>

                <Grid item xs={12}>
                    <Typography variant={'h5'} style={{textAlign: 'center'}}>
                        Upcoming Reviews
                    </Typography>
                </Grid>

                {!chartData || !selectedDecks || selectedDecks.length === 0 ? (
                    <div style={{height: '300px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                ) : (
                    <Chart data={chartData}>
                        {selectedDecks?.map(deck => (
                            <BarSeries
                                key={deck}
                                name={deck}
                                argumentField="date"
                                valueField={deck}
                            />
                        ))}

                    </Chart>
                )}

            </CardContent>
        </Card>
    );
}

export default AnkiUpcomingReviewsChart;