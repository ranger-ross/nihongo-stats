import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {SvgIconComponent} from "@mui/icons-material";
import {CSSProperties} from "react";

export type AppOption = {
    appName: string,
    displayName: 'Overview',
    icon: SvgIconComponent,
    iconStyle: CSSProperties
};

type AppSelectorProps = {
    options: AppOption[],
    selectedApp: string,
    setSelectedApp: (app: string) => void
};

function AppSelector({options, selectedApp, setSelectedApp}: AppSelectorProps) {
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
                                    <img style={iconStyle}
                                         src={icon}
                                         height={23}
                                         alt=""
                                         data-testid="app-selector-icon-img"
                                    />
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
