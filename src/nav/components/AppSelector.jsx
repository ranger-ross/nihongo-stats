import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { bunproAppName, wanikaniAppName, ankiAppName } from '../../Constants.js';

function AppSelector({ selectedApp, setSelectedApp }) {
    return (
        <FormControl fullWidth>
            <InputLabel>Selected App</InputLabel>
            <Select
                size={'small'}
                value={selectedApp}
                label="Selected App"
                onChange={e => setSelectedApp(e.target.value)}
            >
                <MenuItem value={wanikaniAppName}>Wanikani</MenuItem>
                <MenuItem value={ankiAppName}>Anki</MenuItem>
                <MenuItem value={bunproAppName}>BunPro</MenuItem>
            </Select>
        </FormControl>
    );
}


export default AppSelector;