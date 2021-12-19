import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import { bunproAppName, wanikaniAppName, ankiAppName } from '../../Constants.js';

function AppSelector({ selectedApp, setSelectedApp }) {
    return (
        <FormControl fullWidth>
            <InputLabel>Selected App</InputLabel>
            <Select
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