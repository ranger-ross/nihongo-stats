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
                {options.map(({appName, displayName, icon, iconStyle}) => {
                    const IconAsComponent = icon;
                    return (
                        <MenuItem key={appName}
                                  value={appName}
                        >
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                {!icon ? null : typeof icon === 'string' ? (
                                    <img style={iconStyle} src={icon} height={23} alt=""/>
                                ) : (
                                    <IconAsComponent style={iconStyle}/>
                                )}
                                <span>{displayName}</span>
                            </div>
                        </MenuItem>
                    )
                })}
            </Select>
        </FormControl>
    );
}


export default AppSelector;
