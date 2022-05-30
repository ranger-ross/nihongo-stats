import {ArgumentAxis, BarSeries, Chart, Title, Tooltip, ValueAxis} from '@devexpress/dx-react-chart-material-ui';
import {useEffect, useMemo, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService.ts";
import {Animation, EventTracker} from "@devexpress/dx-react-chart";

function parseTimestamp(text) {
    const millis = parseFloat(text) * 86400000;
    const hours = Math.floor((millis % 86400000) / 3600000);
    const days = Math.floor(parseFloat(text));
    return {
        hours,
        days,
    };
}

function LevelToolTip({text}) {
    const {days, hours} = parseTimestamp(text);
    return (
        <div>
            Days: {days}
            <br/>
            Hours: {hours}
        </div>
    );
}

function formatData(data, currentLevel) {
    const rawData = data.data
        .map(level => level.data)
        .filter(level => !level['abandoned_at'] && level['level'] <= currentLevel);

    let map = {};

    for (const level of rawData) {
        const passedAt = !!level['passed_at'] ? new Date(level['passed_at']).getTime() : Date.now();
        const startedAt = new Date(level['created_at']).getTime();

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
        .sort((a, b) => parseInt(a.level) - parseInt(b.level));
}

async function fetchData() {
    const [levelProgress, user] = await Promise.all([
        WanikaniApiService.getLevelProgress(),
        WanikaniApiService.getUser(),
    ]);
    return formatData(levelProgress, user.data.level);
}

function useData() {
    const [levelProgress, setLevelProgress] = useState([]);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setLevelProgress(data);
            })
        return () => isSubscribed = false;
    }, []);

    return levelProgress;
}

function WanikaniLevelProgressChart() {
    const levelProgress = useData();
    const [targetItem, setTargetItem] = useState();

    function BarWithLabel(props) {
        const {arg, val, index} = props;
        const {days, hours} = parseTimestamp(levelProgress[index].days)
        const [animationStyle, setAnimationStyle] = useState({opacity: '0'});
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
                        {days} d
                    </Chart.Label>
                ) : null}

                {hours > 0 ? (
                    <Chart.Label
                        x={arg}
                        y={val - 10}
                        textAnchor={'middle'}
                        style={{...animationStyle, fill: 'white', fontWeight: 'bold'}}
                    >
                        {hours} h
                    </Chart.Label>
                ) : null}
            </>
        );
    }

    return (
        <Chart data={levelProgress}>
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
