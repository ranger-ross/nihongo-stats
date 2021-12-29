import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import * as React from "react";

function DaysSelector({options, days, setDays}) {
    return (
        <ToggleButtonGroup
            value={days}
            size={'small'}
            exclusive
            onChange={e => setDays(parseInt(e.target.value))}
        >
            {options
                .filter(option => !!option)
                .map(option => (
                    <ToggleButton key={option.value}
                                  value={option.value}
                    >
                        {option.text}
                    </ToggleButton>
                ))}
        </ToggleButtonGroup>
    );
}

export default DaysSelector;