import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import {useUserPreferences} from "../../hooks/useUserPreferences";
import {HelpOutline} from "@mui/icons-material";
import {AppNames} from "../../Constants";

const defaultDashboardOptions = [
    {key: AppNames.overview, text: 'Overview'},
    {key: AppNames.anki, text: 'Anki'},
    {key: AppNames.bunpro, text: 'BunPro'},
    {key: AppNames.wanikani, text: 'Wanikani'},
];

function NihongoStatsPreferences() {
    const {globalPreferences: preferences, updateGlobalPreferences} = useUserPreferences();
    return (
        <>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <FormControl style={{minWidth: '200px'}}>
                    <InputLabel id="default-dashboard-label">
                        Default Dashboard
                        <Tooltip
                            title={(
                                <>
                                    When loading Nihongo Stats, if you don't specify a page in the URL, you will
                                    automatically be directed to this dashboard.
                                </>
                            )}
                        >
                            <HelpOutline style={{paddingLeft: '5px'}} fontSize={'small'}/>
                        </Tooltip>
                    </InputLabel>
                    <Select
                        labelId="default-dashboard-label"
                        value={preferences.defaultDashboard}
                        label="Default Dashboard----" // The dashed fix the line spacing for the Tooltip icon
                        onChange={e => updateGlobalPreferences({defaultDashboard: e.target.value})}
                    >
                        {defaultDashboardOptions.map((option) => (
                            <MenuItem key={option.key}
                                      value={option.key}
                            >
                                {option.text}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        </>
    );
}

function WanikaniPreferences() {
    const {wanikaniPreferences: preferences, updateWanikaniPreferences} = useUserPreferences();
    return (
        <>
            <Typography variant={'h5'}>
                Dashboard
            </Typography>


            <div style={{display: 'flex', alignItems: 'center'}}>
                <Checkbox checked={preferences.showPreviousLevelByDefault}
                          size="small"
                          onClick={() => updateWanikaniPreferences({showPreviousLevelByDefault: !preferences.showPreviousLevelByDefault})}
                />
                Show Previous Level by Default
                <Tooltip
                    title={(
                        <>
                            If you have not completed all Radicals, Kanji, and Vocabulary on the previous level,
                            automatically select the 'Show Previous Level' checkbox.
                        </>
                    )}
                >
                    <HelpOutline style={{paddingLeft: '5px'}} fontSize={'small'}/>
                </Tooltip>
            </div>


        </>
    );
}

type UserPreferencesDialogProps = {
    isOpen: boolean,
    onClose: () => void,
};

function UserPreferencesDialog({isOpen, onClose}: UserPreferencesDialogProps) {
    const [tab, setTab] = useState(0);
    return (
        <Dialog onClose={onClose} open={isOpen} fullWidth={true} maxWidth={'md'}>
            <DialogTitle>Preferences</DialogTitle>
            <DialogContent>

                <Tabs value={tab}
                      onChange={(_, i) => setTab(i)}
                      style={{marginBottom: '15px'}}
                >
                    <Tab label="Nihongo Stats" value={0}/>
                    <Tab label="Anki" value={1}/>
                    <Tab label="BunPro" value={2}/>
                    <Tab label="Wanikani" value={3}/>
                </Tabs>

                <div>

                    {/* NIHONGO STATS */}
                    {tab === 0 ? (
                        <NihongoStatsPreferences/>
                    ) : null}

                    {/* ANKI */}
                    {tab === 1 ? (
                        <>
                            No Anki Preferences are available yet
                        </>
                    ) : null}

                    {/* BUNPRO */}
                    {tab === 2 ? (
                        <>
                            No BunPro Preferences are available yet
                        </>
                    ) : null}

                    {/* WANIKANI */}
                    {tab === 3 ? (
                        <WanikaniPreferences/>
                    ) : null}

                </div>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color={'primary'}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default UserPreferencesDialog;
