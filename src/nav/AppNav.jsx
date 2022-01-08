import {Box, Grid} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router";
import {bunproAppName, wanikaniAppName, ankiAppName, overviewAppName} from '../Constants.js';
import {useGlobalState} from "../GlobalState";
import {AllRoutes, RoutePaths} from '../Routes';
import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import AppSelector from "./components/AppSelector";
import WanikaniNav from "./navbars/WanikaniNav.jsx";
import AnkiNav from "./navbars/AnkiNav";
import BunProNav from "./navbars/BunProNav.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";
import OverviewNav from "./navbars/OverviewNav.jsx";

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
    const location = useLocation();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        // Don't navigate to dashboard on page load.
        // (If user refreshes page on history they should not be rerouted)
        if (isFirstLoad) {

            // If path changes, we need to update the SelectedApp to match
            const route = AllRoutes.find(route => route.path === location.pathname)
            if (route.appName !== selectedApp) {
                setSelectedApp(route.appName);
                return;
            }

            setIsFirstLoad(false);
            return;
        }

        switch (selectedApp) {
            case overviewAppName:
                navigate(RoutePaths.overviewDashboard.path);
                break;
            case wanikaniAppName:
                navigate(RoutePaths.wanikaniDashboard.path);
                break;
            case ankiAppName:
                navigate(RoutePaths.ankiDashboard.path);
                break;
            case bunproAppName:
                navigate(RoutePaths.bunproDashboard.path);
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
                {selectedApp === overviewAppName ? (<OverviewNav/>) : null}
                {selectedApp === ankiAppName ? (<AnkiNav/>) : null}
                {selectedApp === bunproAppName && !!bunProApiKey ? (<BunProNav/>) : null}
                {selectedApp === wanikaniAppName && !!wanikaniApiKey ? (<WanikaniNav/>) : null}
            </Box>
        </Grid>
    );
}

export default AppNav;