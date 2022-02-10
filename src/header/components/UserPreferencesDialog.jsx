import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs
} from "@mui/material";
import React, {useState} from "react";

function UserPreferencesDialog({isOpen, onClose}) {

    const [tab, setTab] = useState(0);

    const onSave = () => {
        console.warn('TODO: Implement saving');
        onClose();
    };

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
                        <>
                            No Wanikani Preferences are available yet
                        </>
                    ) : null}

                </div>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color={'warning'}>Cancel</Button>
                <Button onClick={onSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default UserPreferencesDialog;