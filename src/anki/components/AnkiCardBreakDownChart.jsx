import {Card, CardContent} from "@mui/material";
import {useEffect, useState} from "react";
import AnkiApiService from "../service/AnkiApiService.js";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.jsx";
import {Chart, PieSeries, Legend, Title} from '@devexpress/dx-react-chart-material-ui';
import {AnkiColors} from "../../Constants.js";

async function fetchCardBreakDownData(decks) {
    const query = decks
        .map(deck => `deck:"${deck}"`)
        .join(" OR ")

    const newCards = await AnkiApiService.findCards(`(${query}) is:new`);
    const matureCards = await AnkiApiService.findCards(`(${query}) ("is:review" -"is:learn") AND "prop:ivl>=21"`);
    const youngCards = await AnkiApiService.findCards(`(${query}) ("is:review" AND -"is:learn") AND "prop:ivl<21"`);
    const learningCards = await AnkiApiService.findCards(`(${query}) (-"is:review" AND "is:learn")`);
    const relearningCards = await AnkiApiService.findCards(`(${query}) ("is:review" AND "is:learn")`);

    return [
        {type: 'New', color: AnkiColors.blue, count: newCards.length},
        {type: 'Learning', color: AnkiColors.lightOrange, count: learningCards.length},
        {type: 'Relearning', color: AnkiColors.redOrange, count: relearningCards.length},
        {type: 'Young', color: AnkiColors.lightGreen, count: youngCards.length},
        {type: 'Mature', color: AnkiColors.darkGreen, count: matureCards.length},
    ];
}


function AnkiCardBreakDownChart() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [data, setData] = useState([]);

    useEffect(() => {
        let isSubscribed = true;
        if (selectedDecks) {
            fetchCardBreakDownData(selectedDecks)
                .then(_data => {
                    if (!isSubscribed)
                        return;
                    setData(_data);
                });
        }
        return () => isSubscribed = false;
    }, [selectedDecks]);

    return (
        <Card>
            <CardContent>
                <Chart data={data} height={600}>
                    <Title text={'Card Breakdown'}/>
                    <PieSeries
                        argumentField="type"
                        valueField="count"
                        pointComponent={(props) => (
                            <PieSeries.Point {...props}
                                             color={data[props.index].color}
                            />
                        )}
                    />
                    <Legend position={'bottom'}
                            markerComponent={(props) => (
                                <Legend.Marker {...props}
                                               color={data.find(({type}) => type === props.name).color}
                                />
                            )}
                            labelComponent={(props) => (
                                <Legend.Label {...props}
                                              text={`${props.text}  -  ${data.find(({type}) => type === props.text).count}`}
                                />
                            )}
                    />
                </Chart>
            </CardContent>
        </Card>
    );
}

export default AnkiCardBreakDownChart;