import {
    Button, Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs, Tooltip, Typography
} from "@mui/material";
import React, {useState} from "react";
import {useUserPreferences} from "../../hooks/useUserPreferences.jsx";
import {HelpOutline} from "@mui/icons-material";

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

function UserPreferencesDialog({isOpen, onClose}) {
    const [tab, setTab] = useState(0);
    return (
        <Dialog onClose={onClose} open={isOpen} fullWidth={true} maxWidth={'md'}>
            <DialogTitle>Preferences</DialogTitle>
            <DialogContent>

                <Tabs value={tab}
                      onChange={(_, i) => setTab(i)}
                      style={{marginBottom: '15px'}}
                >
                    <Tab label="Anki" value={0}/>
                    <Tab label="BunPro" value={1}/>
                    <Tab label="Wanikani" value={2}/>
                </Tabs>

                <div>

                    {/* ANKI */}
                    {tab === 0 ? (
                        <>
                            No Anki Preferences are available yet
                        </>
                    ) : null}

                    {/* BUNPRO */}
                    {tab === 1 ? (
                        <>
                            No BunPro Preferences are available yet
                        </>
                    ) : null}

                    {/* WANIKANI */}
                    {tab === 2 ? (
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