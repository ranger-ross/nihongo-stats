import {ToggleButton, ToggleButtonGroup} from "@mui/material";

function PeriodSelector({options, period, setPeriod}) {
    return (
        <ToggleButtonGroup
            value={period}
            size={'small'}
            style={{height: '40px'}}
            exclusive
            onChange={e => setPeriod(parseInt(e.target.value))}
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

export default PeriodSelector;
