import {Box, Grid} from "@mui/material";
import React, {useEffect} from "react";
import {useNavigate} from "react-router";
import {bunproAppName, wanikaniAppName, ankiAppName, overviewAppName} from '../Constants.js';
import {useGlobalState} from "../GlobalState";
import {RoutePaths} from '../Routes';
import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import AppSelector from "./components/AppSelector";
import WanikaniNav from "./navbars/WanikaniNav.jsx";
import AnkiNav from "./navbars/AnkiNav";
import BunProNav from "./navbars/BunProNav.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";

const styles = {
    container: {
        padding: '5px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
        gap: '5px'
    },
    menuContainer: {
        textAlign: 'right'
    }
};

const appOptions = [
    {appName: overviewAppName, displayName: 'Overview'},
    {appName: ankiAppName, displayName: 'Anki'},
    {appName: bunproAppName, displayName: 'BunPro'},
    {appName: wanikaniAppName, displayName: 'Wanikani'},
]

function AppNav() {
    const {selectedApp, setSelectedApp} = useGlobalState();
    const navigate = useNavigate();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();

    useEffect(() => {
        switch (selectedApp) {
            case overviewAppName:
                navigate(RoutePaths.overviewDashboard);
                break;
            case wanikaniAppName:
                navigate(RoutePaths.wanikaniDashboard);
                break;
            case ankiAppName:
                navigate(RoutePaths.ankiDashboard);
                break;
            case bunproAppName:
                navigate(RoutePaths.bunproDashboard);
                break;
        }
    }, [selectedApp])

    return (
        <Grid container style={styles.container} alignItems={'flex-end'}>
            <Grid item xs={12} sm={3} md={2} lg={1}>
                <AppSelector options={appOptions}
                             selectedApp={selectedApp}
                             setSelectedApp={setSelectedApp}/>
            </Grid>

            <Box sx={{flexGrow: 1}}>
                {selectedApp === ankiAppName ? (<AnkiNav/>) : null}
                {selectedApp === bunproAppName && !!bunProApiKey ? (<BunProNav/>) : null}
                {selectedApp === wanikaniAppName && !!wanikaniApiKey ? (<WanikaniNav/>) : null}
            </Box>
        </Grid>
    );
}

export default AppNav;