import { Chart, ValueAxis, BarSeries, ArgumentAxis, Title, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import { EventTracker, Animation } from "@devexpress/dx-react-chart";

function LevelToolTip({ text }) {
    const millis = parseFloat(text) * 86400000;
    const hours = Math.floor((millis % 86400000) / 3600000);
    const days = Math.floor(parseFloat(text));
    return (
        <div>
            Days: {days}
            <br />
            Hours: {hours}
        </div>
    );
}

function WanikaniLevelProgessChart() {
    const [levelProgress, setLevelProgress] = useState([]);
    const [targetItem, setTargetItem] = useState();

    useEffect(() => {
        let isSubscribed = true;
        WanikaniApiService.getLevelProgress()
            .then(data => {
                if (!isSubscribed)
                    return;
                const levelData = data.data
                    .map(level => level.data)
                    .map(level => {
                        const passedAt = !!level['passed_at'] ? new Date(level['passed_at']).getTime() : Date.now();
                        const startedAt = new Date(level['created_at']).getTime();
                        return {
                            level: level.level.toString(),
                            days: (passedAt - startedAt) / (86400000)
                        }
                    });
                setLevelProgress(levelData)
            })
        return () => isSubscribed = false;
    }, []);

    return (
        <Chart data={levelProgress}>
            <ValueAxis />
            <ArgumentAxis />
            <Title text="Level Progress" />
            <BarSeries
                valueField="days"
                argumentField="level"
            />
            <EventTracker />
            <Animation />
            <Tooltip targetItem={targetItem}
                onTargetItemChange={setTargetItem}
                contentComponent={LevelToolTip}
            />
        </Chart>
    );
}

export default WanikaniLevelProgessChart;