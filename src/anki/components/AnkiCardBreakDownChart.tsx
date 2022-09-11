import {Card, CardContent, CircularProgress} from "@mui/material";
import AnkiApiService from "../service/AnkiApiService";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import {Chart, PieSeries, Legend, Title} from '@devexpress/dx-react-chart-material-ui';
import {ANKI_COLORS} from "../../Constants";
import * as React from "react";
import {Legend as LegendBase} from "@devexpress/dx-react-chart";
import {useQuery} from "@tanstack/react-query";

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
        {type: 'New', color: ANKI_COLORS.blue, count: newCards.length},
        {type: 'Learning', color: ANKI_COLORS.lightOrange, count: learningCards.length},
        {type: 'Relearning', color: ANKI_COLORS.redOrange, count: relearningCards.length},
        {type: 'Young', color: ANKI_COLORS.lightGreen, count: youngCards.length},
        {type: 'Mature', color: ANKI_COLORS.darkGreen, count: matureCards.length},
    ];
}

type LegendMarkerProps = object & { className?: string; style?: React.CSSProperties; [x: string]: any };

function AnkiCardBreakDownChart() {
    const {selectedDecks} = useSelectedAnkiDecks();

    const {data, error, isLoading} = useQuery(['anki'], () => fetchCardBreakDownData(selectedDecks), {
        enabled: !!selectedDecks
    });

    if (error) {
        return (
            <Card>
                <CardContent>
                    <div style={{height: '400px', textAlign: 'center'}}>
                        An error occurred, try reloading the page
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isLoading || !data) {
        return (
            <Card>
                <CardContent>
                    <div style={{height: '400px', textAlign: 'center'}}>
                        <CircularProgress style={{margin: '100px'}}/>
                    </div>
                </CardContent>
            </Card>
        );
    }

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
