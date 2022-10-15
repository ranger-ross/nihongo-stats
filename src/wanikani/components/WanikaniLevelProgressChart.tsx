import {ArgumentAxis, BarSeries, Chart, Title, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import {CSSProperties, useEffect, useMemo, useState} from "react";
import {Animation, BarSeries as BarSeriesBase, EventTracker, SeriesRef} from "@devexpress/dx-react-chart";
import {WanikaniLevelProgression} from "../models/WanikaniLevelProgress";
import {WanikaniUser} from "../models/WanikaniUser";

function parseTimestamp(text: string | number) {
    const millis = parseFloat(text as string) * 86400000;
    const hours = Math.floor((millis % 86400000) / 3600000);
    const days = Math.floor(parseFloat(text as string));
    return {
        hours,
        days,
    };
}

function LevelToolTip({text}: { text: string }) {
    const {days, hours} = parseTimestamp(text);
    return (
        <div>
            Days: {days}
            <br/>
            Hours: {hours}
        </div>
    );
}

type FormattedData = { level: string, days: number, startedAt: number };

function formatData(data: WanikaniLevelProgression[], currentLevel: number): FormattedData[] {
    if (!data || data.length == 0)
        return [];

    const rawData = data
        .filter(level => !level.abandonedAt && level.level <= currentLevel);

    const map: { [level: number]: FormattedData } = {};

    for (const level of rawData) {
        const passedAt = level.passedAt?.getTime() ?? Date.now();
        const startedAt = level.createdAt.getTime();

        const add = () => map[level.level] = {
            level: level.level.toString(),
            days: (passedAt - startedAt) / (86400000),
            startedAt,
        };

        if (!!map[level.level]) {
            if (map[level.level].startedAt < startedAt) {
                add();
            }
        } else {
            add();
        }
    }

    return Object.values(map)
        .sort((a, b) => parseInt(a.level) - parseInt(b.level)) ?? [];
}

type WanikaniLevelProgressChartProps = {
    levelProgress: WanikaniLevelProgression[]
    user: WanikaniUser
}

function WanikaniLevelProgressChart({levelProgress, user}: WanikaniLevelProgressChartProps) {
    const data = useMemo(() => formatData(levelProgress, user.level), [levelProgress, user.level]);
    const [targetItem, setTargetItem] = useState<SeriesRef>();

    function BarWithLabel(props: BarSeriesBase.PointProps) {
        const {arg, val, index} = props;
        const {days, hours} = parseTimestamp(data[index].days)
        const [animationStyle, setAnimationStyle] = useState<CSSProperties>({opacity: '0'});
        const animationInitialDelay = 1_000;

        useEffect(() => {
            const startAnimation = setTimeout(() => {
                setAnimationStyle({
                    opacity: '1',
                    transition: 'opacity 1s'
                });
            }, animationInitialDelay)

            return () => clearTimeout(startAnimation);
        }, []);

        return (
            <>
                <BarSeries.Point {...props}/>

                {days > 0 ? (
                    <Chart.Label
                        x={arg}
                        y={val - 25}
                        textAnchor={'middle'}
                        style={{...animationStyle, fill: 'white', fontWeight: 'bold'}}
                    >
                        {days + ' d'}
                    </Chart.Label>
                ) : null}

                {hours > 0 ? (
                    <Chart.Label
                        x={arg}
                        y={val - 10}
                        textAnchor={'middle'}
                        style={{...animationStyle, fill: 'white', fontWeight: 'bold'}}
                    >
                        {hours + ' h'}
                    </Chart.Label>
                ) : null}
            </>
        );
    }

    return (
        <Chart data={data}>
            <ValueAxis/>
            <ArgumentAxis/>
            <Title text="Level Progress"/>
            <BarSeries
                valueField="days"
                argumentField="level"
                pointComponent={useMemo(() => BarWithLabel, [levelProgress])}
            />
            <EventTracker/>
            <Animation/>
            <Tooltip targetItem={targetItem}
                     onTargetItemChange={setTargetItem}
                     contentComponent={LevelToolTip}
            />
        </Chart>
    );
}

export default WanikaniLevelProgressChart;
