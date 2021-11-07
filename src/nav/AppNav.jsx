import { Grid, IconButton, Menu, MenuItem } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import MoreIcon from '@mui/icons-material/MoreVert';
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
    selectorContainer: {
        width: '120px',
        marginLeft: '5px',
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
        <Grid container className={classes.container} alignItems={'flex-end'}>
            <Grid item xs={1} className={classes.selectorContainer}>
                <AppSelector selectedApp={selectedApp} setSelectedApp={setSelectedApp} />
            </Grid>
            <Grid item style={{marginLeft: '10px'}}>
                {selectedApp === wanikaniAppName && !!apiKey ? (<WanikaniNav />) : null}
                {/* <div style={{textAlign: 'right'}}>
                    {selectedApp === wanikaniAppName && !!apiKey ? (<WanikaniOptionMenu />) : null}
                </div> */}
            </Grid>
        </Grid>

    );
}

export default AppNav;