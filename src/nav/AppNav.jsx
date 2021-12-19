import {Box, Grid} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import React, {useEffect} from "react";
import {useNavigate} from "react-router";
import {bunproAppName, wanikaniAppName, ankiAppName} from '../Constants.js';
import {useGlobalState} from "../GlobalState";
import {RoutePaths} from '../Routes';
import {useWanikaniApiKey} from "../wanikani/stores/WanikaniApiKeyStore.js";
import AppSelector from "./components/AppSelector";
import WanikaniNav from "./navbars/WanikaniNav.jsx";
import AnkiNav from "./navbars/AnkiNav";

const useStyles = makeStyles({
    container: {
        padding: '5px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
    },
    menuContainer: {
        textAlign: 'right'
    }
});

function AppNav() {
    const {selectedApp, setSelectedApp} = useGlobalState();
    const navigate = useNavigate();
    const classes = useStyles();
    const {apiKey} = useWanikaniApiKey();

    useEffect(() => {
        switch (selectedApp) {
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
        <Grid container className={classes.container} alignItems={'flex-end'} style={{gap: '5px'}}>
            <Grid item xs={12} sm={3} md={2} lg={1}>
                <AppSelector selectedApp={selectedApp}
                             setSelectedApp={setSelectedApp}/>
            </Grid>

            <Box sx={{flexGrow: 1}}>
                {selectedApp === wanikaniAppName && !!apiKey ? (<WanikaniNav/>) : null}
                {selectedApp === ankiAppName && !!apiKey ? (<AnkiNav/>) : null}
            </Box>
        </Grid>
    );
}

export default AppNav;