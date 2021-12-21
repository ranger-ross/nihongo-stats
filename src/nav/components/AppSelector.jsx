import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

function AppSelector({options, selectedApp, setSelectedApp}) {
    return (
        <FormControl fullWidth>
            <InputLabel>Selected App</InputLabel>
            <Select
                size={'small'}
                value={selectedApp}
                label="Selected App"
                onChange={e => setSelectedApp(e.target.value)}
            >
                {options.map(({appName, displayName}) => (
                    <MenuItem value={appName}>{displayName}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}


export default AppSelector;