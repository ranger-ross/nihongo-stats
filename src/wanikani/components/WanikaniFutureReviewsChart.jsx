import {Chart, ValueAxis, BarSeries, ArgumentAxis, Tooltip} from '@devexpress/dx-react-chart-material-ui';
import React, {useState, useEffect, useMemo} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {Animation, ArgumentScale, EventTracker, Stack, ValueScale} from "@devexpress/dx-react-chart";
import {Card, CardContent, Typography, Checkbox} from "@mui/material";
import {addDays, addHours, areDatesSameDay, areDatesSameDayAndHour, truncMinutes} from '../../util/DateUtils.js';
import {WanikaniColors} from '../../Constants.js';
import DaysSelector from "../../shared/DaysSelector.jsx";
import {scaleBand} from 'd3-scale';

const units = {
    days: 'days',
    hours: 'hours',
}

const daysOptions = [
    {value: 7, text: '7'},
    {value: 14, text: '14'},
    {value: 30, text: '30'},
];
const hoursOptions = [
    {value: 24, text: '24'},
    {value: 48, text: '48'},
    {value: 72, text: '72'},
];

function addTimeToDate(date, unit, amount) {
    if (unit === units.days) {
        return addDays(date, amount);
    } else {
        return addHours(date, amount);
    }
}

function isPeriodTheSame(date1, date2, unit) {
    if (unit === units.days) {
        return areDatesSameDay(date1, date2);
    } else {
        return areDatesSameDayAndHour(date1, date2);
    }
}

function getHoursLabelText(date, isToolTipLabel) {
    let hours = date.getHours();
    let isPm = hours > 12;
    if (isPm) {
        hours -= 12;
    }
    if (hours == 0) {
        hours = 12;
    }

    if (!isToolTipLabel && ![6, 12].includes(hours)) {
        return '';
    }

    return `${hours} ${isPm ? 'PM' : 'AM'}`;
}

function getLabelText(unit, date, isToolTipLabel) {
    let _date = new Date(date)
    if (unit === units.days) {
        return `${_date.getMonth() + 1}/${_date.getDate()}`;
    } else {
        return getHoursLabelText(_date, isToolTipLabel);
    }
}

function getChartStartTime() { // Start chart at the beginning of the next hour
    return addHours(truncMinutes(new Date()), 1);
}

function formatChartData(rawData, unit, period, initialReviewCount) {
    const data = rawData
        .filter(assignment => new Date(assignment.data['available_at']) > addTimeToDate(new Date(), unit, -1))
        .filter(assignment => new Date(assignment.data['available_at']) < addTimeToDate(new Date(), unit, period));

    let totalReviewCount = initialReviewCount;
    let daysData = []
    for (let i = 0; i < period; i++) {
        const date = addTimeToDate(getChartStartTime(), unit, i);
        const assignmentsOnDay = data.filter(assignment => isPeriodTheSame(new Date(assignment.data['available_at']), date, unit));
        totalReviewCount += assignmentsOnDay.length;

        daysData.push({
            radicals: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'radical').length,
            kanji: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'kanji').length,
            vocabulary: assignmentsOnDay.filter(assignment => assignment.data['subject_type'] === 'vocabulary').length,
            reviews: assignmentsOnDay.length,
            time: date.getTime(),
            total: totalReviewCount
        });
    }
    return daysData;
}

async function fetchFutureReviews() {
    const data = await WanikaniApiService.getAllAssignments();
    return data.filter(assignment => !assignment.data['burned_at'] || !assignment.data['available_at']);
}

function SimpleBar({x, y, width, offsetY, fill, style}) {
    const path = `M ${x} ${offsetY}
   L ${width + x} ${offsetY}
   L ${width + x} ${y}
   L ${x} ${y}
   Z`;

    return (
        <path d={path}
              fill={fill}
              style={style}
        />
    );
}

function WanikaniFutureReviewsChart() {
    const [rawData, setRawData] = useState([]);
    const [initialReviewCount, setInitialReviewCount] = useState(0);
    const [targetItem, setTargetItem] = useState();
    const [unit, setUnit] = useState(units.hours);
    const [period, setPeriod] = useState(48);

    useEffect(() => {
        let isSubscribed = true;
        fetchFutureReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setRawData(data);
            });
        WanikaniApiService.getPendingLessonsAndReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setInitialReviewCount(data.reviews);
            });
        return () => isSubscribed = false;
    }, []);

    const chartData = useMemo(() => !rawData || rawData.length == 0 ? [] : formatChartData(rawData, unit, period, initialReviewCount), [rawData, unit, period, initialReviewCount]);

    function ReviewsToolTip({targetItem}) {
        const {radicals, kanji, vocabulary, time} = chartData[targetItem.point];
        const rowStyle = {display: 'flex', justifyContent: 'space-between', gap: '10px'};
        return (
            <div>
                <div style={rowStyle}>
                    <div>{unit == units.hours ? 'Time' : 'Date'}:</div>
                    <div>{getLabelText(unit, time, true)}</div>
                </div>
                <div style={rowStyle}>
                    <div>Radicals:</div>
                    <div>{radicals}</div>
                </div>
                <div style={rowStyle}>
                    <div>Kanji:</div>
                    <div>{kanji}</div>
                </div>
                <div style={rowStyle}>
                    <div>Vocabulary:</div>
                    <div>{vocabulary}</div>
                </div>
            </div>
        );
    }

    function LabelWithDate(props) {
        const {text} = props;
        let label = '';
        if (text) {
            const rawTimestamp = parseInt(text);
            label = !!rawTimestamp ? getLabelText(unit, rawTimestamp, false) : '';
        }
        return (
            <ArgumentAxis.Label
                {...props}
                text={label}
            />
        );
    }

    function isLabelVisible(seriesIndex, index) {
        if (seriesIndex === 2)
            return true;

        if (seriesIndex === 1)
            return chartData[index].vocabulary === 0;

        if (seriesIndex === 0)
            return chartData[index].kanji === 0 && chartData[index].vocabulary === 0;
        return false;
    }

    function BarWithLabel(props) {
        const {
            arg, barWidth, maxBarWidth, val, startVal,
            color, value, style, seriesIndex, index, animation
        } = props; // TODO: handle animations
        if (value === 0)
            return (<></>);

        const width = maxBarWidth * barWidth;

        return (
            <>
                <SimpleBar x={arg - width / 2}
                           width={width}
                           y={val}
                           offsetY={startVal}
                           fill={color}
                           style={style}
                />

                {isLabelVisible(seriesIndex, index) ? (
                    <Chart.Label
                        x={arg}
                        y={val - 10}
                        textAnchor={'middle'}
                        style={{fill: 'white'}}
                    >
                        {value}
                    </Chart.Label>
                ) : null}
            </>
        );
    }

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>

                        <div>
                            <Checkbox value={unit === units.days}
                                      onChange={e => {
                                          if (e.target.checked) {
                                              setPeriod(14);
                                              setUnit(units.days);
                                          } else {
                                              setPeriod(48);
                                              setUnit(units.hours);
                                          }
                                      }}
                            />
                            Show Days
                        </div>

                        <Typography variant={'h5'}>
                            Future Reviews
                        </Typography>

                        <DaysSelector days={period}
                                      setDays={setPeriod}
                                      options={unit === units.days ? daysOptions : hoursOptions}
                        />
                    </div>

                    <div style={{flexGrow: '1'}}>
                        <Chart data={chartData}>
                            <ValueAxis  />
                            {/*<ValueScale name={'total'} modifyDomain={domain => domain} factory={() => }/>*/}
                            {/*<ValueAxis*/}
                            {/*    scaleName="total"*/}
                            {/*    */}
                            {/*/>*/}

                            {/*<ValueAxis*/}
                            {/*    scaleName="daily"*/}
                            {/*    position="right"*/}
                            {/*/>*/}


                            <ArgumentScale factory={scaleBand}/>
                            <ArgumentAxis labelComponent={LabelWithDate}/>

                            <BarSeries
                                name="radicals"
                                valueField="radicals"
                                argumentField="time"
                                color={WanikaniColors.blue}
                                pointComponent={BarWithLabel}
                            />

                            <BarSeries
                                name="kanji"
                                valueField="kanji"
                                argumentField="time"
                                color={WanikaniColors.pink}
                                pointComponent={BarWithLabel}
                            />

                            <BarSeries
                                name="vocabulary"
                                valueField="vocabulary"
                                argumentField="time"
                                color={WanikaniColors.purple}
                                pointComponent={BarWithLabel}
                            />

                            <Stack
                                stacks={[{series: ['radicals', 'kanji', 'vocabulary']}]}
                            />

                            <EventTracker/>
                            <Tooltip targetItem={targetItem ? {...targetItem, series: 'vocabulary'} : null}
                                     onTargetItemChange={setTargetItem}
                                     contentComponent={ReviewsToolTip}
                            />
                            <Animation/>
                        </Chart>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniFutureReviewsChart;