import { Box, Grid } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { bunproAppName, wanikaniAppName } from '../Constants.js';
import { useGlobalState } from "../GlobalState";
import { RoutePaths } from '../Routes';
import { useWanikaniApiKey } from "../wanikani/stores/WanikaniApiKeyStore.js";
import AppSelector from "./AppSelector";
import WanikaniNav from "./WanikaniNav.jsx";
import WanikaniOptionMenu from "./WanikaniOptionMenu.jsx";

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
    const { selectedApp, setSelectedApp } = useGlobalState();
    const navigate = useNavigate();
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    useEffect(() => {
        switch (selectedApp) {
            case wanikaniAppName:
                navigate(RoutePaths.wanikaniDashboard);
                break;
            case bunproAppName:
                navigate(RoutePaths.bunproDashboard);
                break;
        }
    }, [selectedApp])

    return (
        <Grid container className={classes.container} alignItems={'flex-end'} spacing={1}>
            <Grid item xs={12} sm={3} md={2} lg={1} className={classes.selectorContainer}>
                <AppSelector selectedApp={selectedApp} setSelectedApp={setSelectedApp} />
            </Grid>

            <Box sx={{ flexGrow: 1 }}>
                {selectedApp === wanikaniAppName && !!apiKey ? (<WanikaniNav />) : null}
            </Box>

            <Box className={classes.menuContainer}>
                {selectedApp === wanikaniAppName && !!apiKey ? (<WanikaniOptionMenu />) : null}
            </Box>
        </Grid>
    );
}

export default AppNav;