import {addDays, addHours, areDatesSameDay, areDatesSameDayAndHour, truncDate, truncMinutes} from "./DateUtils.ts";
import {MenuItem, Select} from "@mui/material";
import {ArgumentAxis, Chart} from "@devexpress/dx-react-chart-material-ui";
import {BarSeries, ScatterSeries} from "@devexpress/dx-react-chart";
import {useDeviceInfo} from "../hooks/useDeviceInfo.jsx";

export const UpcomingReviewUnits = {
    hours: {
        key: 'hours',
        text: 'Hours',
        default: 48,
        trunc: truncMinutes,
        isPeriodTheSame: areDatesSameDayAndHour,
    },
    days: {
        key: 'days',
        text: 'Days',
        default: 14,
        trunc: truncDate,
        isPeriodTheSame: areDatesSameDay,
    }
};

export const UpcomingReviewPeriods = {
    days: [
        {value: 7, text: '7'},
        {value: 14, text: '14'},
        {value: 30, text: '30'},
    ],
    hours: [
        {value: 24, text: '24'},
        {value: 48, text: '48'},
        {value: 72, text: '72'},
    ]
}


export function addTimeToDate(date, unit, amount) {
    if (unit.key === UpcomingReviewUnits.days.key) {
        return addDays(date, amount);
    } else {
        return addHours(date, amount);
    }
}


export function UnitSelector({options, unit, onChange}) {
    return (
        <Select
            style={{minWidth: '100px', height: '40px'}}
            size={'small'}
            value={unit.key}
            onChange={e => onChange(options.find(o => o.key === e.target.value))}
        >
            {options.map((option) => (
                <MenuItem key={option.key}
                          value={option.key}
                >
                    {option.text}
                </MenuItem>
            ))}
        </Select>
    );
}

function getHoursPrimaryLabelText(date, isToolTipLabel, isMobile) {
    const hoursToShow = isMobile ? [0, 12] : [0, 6, 12, 18]

    if (!isToolTipLabel && !hoursToShow.includes(date.getHours())) {
        return null;
    }

    return date.toLocaleTimeString("en-US", {hour: 'numeric'});
}

function getHoursSecondaryLabelText(date, isToolTipLabel) {
    if (!isToolTipLabel && ![0].includes(date.getHours())) {
        return null;
    }

    return date.toLocaleDateString("en-US", {month: 'numeric', day: '2-digit'});
}

export function formatTimeUnitLabelText(unit, date, isToolTipLabel, isMobile) {
    let _date = new Date(date)
    if (unit.key === UpcomingReviewUnits.days.key) {
        return {primary: `${_date.getMonth() + 1}/${_date.getDate()}`, secondary: null};
    } else {
        return {
            primary: getHoursPrimaryLabelText(_date, isToolTipLabel, isMobile),
            secondary: getHoursSecondaryLabelText(_date)
        };
    }
}

export function createUpcomingReviewsChartLabel(unit, isMobile) {
    return function LabelWithDate(props) {
        const {text} = props;
        let primaryLabel = null;
        let secondaryLabel = null;
        if (text) {
            const rawTimestamp = parseInt(text);
            if (!!rawTimestamp) {
                const formatted = formatTimeUnitLabelText(unit, rawTimestamp, false, isMobile);
                primaryLabel = formatted.primary;
                secondaryLabel = formatted.secondary;
            }
        }
        return (
            <>
                {!!primaryLabel ? (
                    <ArgumentAxis.Label
                        {...props}
                        text={primaryLabel}
                    />
                ) : null}

                {!!secondaryLabel ? (
                    <ArgumentAxis.Label
                        {...props}
                        style={{fontWeight: 'bold'}}
                        text={secondaryLabel}
                        dy={'33'}
                    />
                ) : null}
            </>
        );
    }
}

export function createUpcomingReviewsChartBarLabel(isLabelVisible) {
    return function BarWithLabel(props) {
        const {arg, val, value, seriesIndex, index} = props;

        if (value === 0)
            return (<></>);

        return (
            <>
                <BarSeries.Point {...props}/>

                {isLabelVisible(seriesIndex, index) ? (
                    <Chart.Label
                        x={arg}
                        y={val - 10}
                        textAnchor={'middle'}
                        style={{fill: 'white', fontWeight: 'bold'}}
                    >
                        {value}
                    </Chart.Label>
                ) : null}
            </>
        );
    }
}

export function UpcomingReviewsScatterPoint(props) {
    const {isMobile} = useDeviceInfo();
    const size = isMobile ? 4 : 6;
    return (
        <ScatterSeries.Point {...props} point={{size}}/>
    );
}

