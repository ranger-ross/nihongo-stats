import React, {useEffect, useState} from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
} from "@mui/material";
import BunProApiService from "../../bunpro/service/BunProApiService";
import WanikaniApiService from "../../wanikani/service/WanikaniApiService";
import AnkiApiService from "../../anki/service/AnkiApiService";
import {useWanikaniPreloadStatus} from "../../hooks/useWanikaniPreloadStatus";
import {useBunProPreloadStatus} from "../../hooks/useBunProPreloadStatus";

type DialogOptions = {
    anki: boolean,
    bunPro: boolean,
    wanikani: boolean,
}

function usePurgeLocalData() {
    const {setStatus: setWanikaniPreloadStatus} = useWanikaniPreloadStatus();
    const {setStatus: setBunProPreloadStatus} = useBunProPreloadStatus();

    return {
        purgeLocalData: async function (options: DialogOptions) {
            console.log('Purging local data', options);

            const jobs = [];

            if (options.anki) {
                jobs.push(AnkiApiService.flushCache());
            }

            if (options.bunPro) {
                jobs.push(BunProApiService.flushCache());
                setBunProPreloadStatus(false);
            }

            if (options.wanikani) {
                jobs.push(WanikaniApiService.flushCache());
                setWanikaniPreloadStatus(false);
            }
            return Promise.all(jobs);
        }
    };
}

const defaultState: DialogOptions = {
    anki: false,
    bunPro: false,
    wanikani: false,
};

type ClearCacheDialogProps = {
    isOpen: boolean,
    onClose: () => void
};

export function ClearCacheDialog({isOpen, onClose}: ClearCacheDialogProps) {
    const [state, setState] = useState(defaultState);
    const {purgeLocalData} = usePurgeLocalData();

    useEffect(() => {
        if (!isOpen)
            return;
        setState(defaultState);
    }, [isOpen]);


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            ...state,
            [event.target.name]: event.target.checked,
        });
    };

    const handleClear = () => {
        purgeLocalData(state)
            .then(() => window.location.reload());
    };

    const {anki, bunPro, wanikani} = state;
    const error = [anki, bunPro, wanikani].filter(v => v).length === 0;

    return (
        <Dialog onClose={onClose} open={isOpen}>
            <DialogTitle>Force Refresh</DialogTitle>
            <DialogContent>
                <FormControl
                    required
                    component="fieldset"
                    sx={{m: 3}}
                    variant="standard"
                >
                    <FormHelperText>Which app should be refreshed?</FormHelperText>

                    <FormGroup>

                        <FormControlLabel
                            control={
                                <Checkbox checked={anki} onChange={handleChange} name="anki"/>
                            }
                            label="Anki"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={bunPro} onChange={handleChange} name="bunPro"/>
                            }
                            label="BunPro"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={wanikani} onChange={handleChange} name="wanikani"/>
                            }
                            label="Wanikani"
                        />

                    </FormGroup>
                </FormControl>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleClear}
                        disabled={error}>Clear</Button>
            </DialogActions>
        </Dialog>
    );
}
