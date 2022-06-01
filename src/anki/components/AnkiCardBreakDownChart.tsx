import {Card, CardContent} from "@mui/material";
import {useEffect, useState} from "react";
import AnkiApiService from "../service/AnkiApiService";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import {Chart, PieSeries, Legend, Title} from '@devexpress/dx-react-chart-material-ui';
import {AnkiColors} from "../../Constants";
import * as React from "react";
import {Legend as LegendBase} from "@devexpress/dx-react-chart";

type StageBreakDown = {
    type: string,
    color: string,
    count: number,
}

async function fetchCardBreakDownData(decks: string[]): Promise<StageBreakDown[]> {
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

type LegendMarkerProps = object & { className?: string; style?: React.CSSProperties; [x: string]: any };

function AnkiCardBreakDownChart() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [data, setData] = useState<StageBreakDown[]>([]);

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
        return () => {
            isSubscribed = false;
        }
    }, [selectedDecks]);

    return (
        <Card>
            <CardContent>
                {/*@ts-ignore*/}
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
                            markerComponent={(props: LegendMarkerProps) => (
                                <Legend.Marker {...props}
                                               color={(data.find(({type}) => type === props.name) as StageBreakDown).color}
                                />
                            )}
                            labelComponent={(props: LegendBase.LabelProps) => (
                                <Legend.Label {...props}
                                              text={`${props.text}  -  ${(data.find(({type}) => type === props.text) as StageBreakDown).count}`}
                                />
                            )}
                    />
                </Chart>
            </CardContent>
        </Card>
    );
}

export default AnkiCardBreakDownChart;
