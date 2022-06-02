import {Box, Grid} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router";
// @ts-ignore
import {AllRoutes, convertAppNameToDashboardRoute} from '../Routes';
import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import AppSelector, {AppOption} from "./components/AppSelector";
import WanikaniNav from "./navbars/WanikaniNav";
import AnkiNav from "./navbars/AnkiNav";
import BunProNav from "./navbars/BunProNav";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import OverviewNav from "./navbars/OverviewNav";
import {AppNames} from "../Constants";
import {useSelectedApp} from "../hooks/useSelectedApp";
// @ts-ignore
import ankiIcon from '../../assets/icons/anki-icon.png';
// @ts-ignore
import bunProIcon from '../../assets/icons/bunpro-icon.png';
// @ts-ignore
import wanikaniIcon from '../../assets/icons/wanikani-icon.png';
import {BarChart} from "@mui/icons-material";
import {AppStyles} from "../util/TypeUtils";

const styles: AppStyles = {
    container: {
        padding: '5px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
        gap: '5px'
    },
    menuContainer: {
        textAlign: 'right'
    }
};

const appOptions: AppOption[] = [
    {appName: AppNames.overview, displayName: 'Overview', icon: BarChart, iconStyle: {color: '#21bcff'}},
    {appName: AppNames.anki, displayName: 'Anki', icon: ankiIcon},
    {appName: AppNames.bunpro, displayName: 'BunPro', icon: bunProIcon, iconStyle: {marginLeft: '-4px'}},
    {appName: AppNames.wanikani, displayName: 'Wanikani', icon: wanikaniIcon},
]

function AppNav() {
    const {selectedApp, setSelectedApp} = useSelectedApp();
    const navigate = useNavigate();
    const location = useLocation();
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const route = AllRoutes.find((route: any) => route.path === location.pathname);

    useEffect(() => {
        // Don't navigate to dashboard on page load.
        // (If user refreshes page on history they should not be rerouted)
        if (isFirstLoad) {

            // If path changes, we need to update the SelectedApp to match
            if (!!route && route.appName !== selectedApp && !route.hideNav) {
                if (route.appName) {
                    setSelectedApp(route.appName);
                    return;
                }
            }

            setIsFirstLoad(false);
            return;
        }

        const dashboardRoute = convertAppNameToDashboardRoute(selectedApp);
        if (dashboardRoute) {
            navigate(dashboardRoute.path);
        }
    }, [selectedApp])

    const hideNav = !!route && route.hideNav;

    return (
        hideNav ? null : (
            <Grid container style={styles.container} alignItems={'flex-end'}>
                <Grid item xs={12} sm={3} md={2} lg={1}>
                    <AppSelector options={appOptions}
                                 selectedApp={selectedApp}
                                 setSelectedApp={setSelectedApp}/>
                </Grid>

                <Box sx={{flexGrow: 1}}>
                    {selectedApp === AppNames.overview ? (<OverviewNav/>) : null}
                    {selectedApp === AppNames.anki ? (<AnkiNav/>) : null}
                    {selectedApp === AppNames.bunpro && !!bunProApiKey ? (<BunProNav/>) : null}
                    {selectedApp === AppNames.wanikani && !!wanikaniApiKey ? (<WanikaniNav/>) : null}
                </Box>
            </Grid>
        )
    );
}

export default AppNav;
