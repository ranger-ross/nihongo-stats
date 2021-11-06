import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

function AppSelector({ selectedApp, setSelectedApp }) {
    return (
        <FormControl fullWidth>
            <InputLabel>Selected App</InputLabel>
            <Select
                value={selectedApp}
                label="Selected App"
                onChange={e => setSelectedApp(e.target.value)}
            >
                <MenuItem value={'wanikani'}>Wanikani</MenuItem>
                <MenuItem value={'bunpro'}>BunPro</MenuItem>
            </Select>
        </FormControl>
    );
}


export default AppSelector;