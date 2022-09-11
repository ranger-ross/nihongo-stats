import {CircularProgress} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import {Chart, Legend, PieSeries, Title} from '@devexpress/dx-react-chart-material-ui';
import {Legend as LegendBase} from "@devexpress/dx-react-chart";
import {SimpleCard} from "../../shared/SimpleCard";
import {useAnkiCardBreakdown} from "../service/AnkiQueries";
import {StageBreakDown} from "../service/AnkiDataUtil";

type LegendMarkerProps = object & { className?: string; style?: React.CSSProperties; [x: string]: any };

function AnkiCardBreakDownChart() {
    const {selectedDecks} = useSelectedAnkiDecks();

    const {data, error, isLoading, isSuccess} = useAnkiCardBreakdown(selectedDecks);

    error && console.error(error);

    if (isLoading) {
        return (
            <SimpleCard>
                <div style={{height: '400px', textAlign: 'center'}}>
                    <CircularProgress style={{margin: '100px'}}/>
                </div>
            </SimpleCard>
        );
    }

    if (!isSuccess) {
        console.error(error);
        return (
            <SimpleCard>
                <div style={{height: '400px', textAlign: 'center'}}>
                    An error occurred, try reloading the page
                </div>
            </SimpleCard>
        );
    }

    return (
        <SimpleCard>
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
        </SimpleCard>
    );
}

export default AnkiCardBreakDownChart;
