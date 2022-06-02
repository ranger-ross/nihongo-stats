import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import React from "react";

type Option = {
    text: string,
    value: number
};

type Props = {
    options: (Option | null)[],
    period: number,
    setPeriod: (v: number) => void
};

function PeriodSelector({options, period, setPeriod}: Props) {
    return (
        <ToggleButtonGroup
            value={period}
            size={'small'}
            style={{height: '40px'}}
            exclusive
            onChange={(e: React.MouseEvent<any>) => setPeriod(parseInt(e.currentTarget.value))}
        >
            {options
                .filter(option => !!option)
                .map(option => option as Option)
                .map((option: Option) => (
                    <ToggleButton key={option.value}
                                  value={option.value}
                    >
                        {option.text}
                    </ToggleButton>
                ))}
        </ToggleButtonGroup>
    );
}

export default PeriodSelector;
