import {Chart, ValueAxis, BarSeries, ArgumentAxis, Title, Tooltip} from '@devexpress/dx-react-chart-material-ui';
import {useState, useEffect} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {EventTracker, Animation} from "@devexpress/dx-react-chart";

function parseTimestamp(text) {
    const millis = parseFloat(text) * 86400000;
    const hours = Math.floor((millis % 86400000) / 3600000);
    const days = Math.floor(parseFloat(text));
    return {
        hours,
        days
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

function formatData(data) {
    return data.data
        .map(level => level.data)
        .map(level => {
            const passedAt = !!level['passed_at'] ? new Date(level['passed_at']).getTime() : Date.now();
            const startedAt = new Date(level['created_at']).getTime();
            return {
                level: level.level.toString(),
                days: (passedAt - startedAt) / (86400000)
            }
        });
}

function WanikaniLevelProgressChart() {
    const [levelProgress, setLevelProgress] = useState([]);
    const [targetItem, setTargetItem] = useState();

    useEffect(() => {
        let isSubscribed = true;
        WanikaniApiService.getLevelProgress()
            .then(data => {
                if (!isSubscribed)
                    return;
                setLevelProgress(formatData(data));
            })
        return () => isSubscribed = false;
    }, []);

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
                <BarSeries.Point {...props}
                                 animation={(startCoords, endCoords, processAnimation, setAttributes, delay) => {
                                     console.log({startCoords, endCoords, processAnimation, setAttributes, delay})
                                     return props.animation(startCoords, endCoords, processAnimation, setAttributes, delay)
                                 }}/>

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
                pointComponent={BarWithLabel}
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