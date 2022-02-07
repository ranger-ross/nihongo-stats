import {addDays, addHours, areDatesSameDay, areDatesSameDayAndHour, truncDate, truncMinutes} from "./DateUtils.js";
import {MenuItem, Select} from "@mui/material";
import React from "react";
import {ArgumentAxis} from "@devexpress/dx-react-chart-material-ui";

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
            style={{minWidth: '130px'}}
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

function getHoursLabelText(date, isToolTipLabel) {
    if (!isToolTipLabel && ![0, 6, 12, 18].includes(date.getHours())) {
        return '';
    }

    return date.toLocaleTimeString("en-US", {hour: 'numeric'});
}

export function formatTimeUnitLabelText(unit, date, isToolTipLabel) {
    let _date = new Date(date)
    if (unit.key === UpcomingReviewUnits.days.key) {
        return `${_date.getMonth() + 1}/${_date.getDate()}`;
    } else {
        return getHoursLabelText(_date, isToolTipLabel);
    }
}

export function createUpcomingReviewsChartLabel(unit) {
    return function LabelWithDate(props) {
        const {text} = props;
        let label = '';
        if (text) {
            const rawTimestamp = parseInt(text);
            label = !!rawTimestamp ? formatTimeUnitLabelText(unit, rawTimestamp, false) : '';
        }
        return (
            <ArgumentAxis.Label
                {...props}
                text={label}
            />
        );
    }
}