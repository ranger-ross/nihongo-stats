import { Box, GridLegacy } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AllRoutes, convertAppNameToDashboardRoute } from '../Routes';
import { useWanikaniApiKey } from "../hooks/useWanikaniApiKey";
import AppSelector, { AppOption } from "./components/AppSelector";
import WanikaniNav from "./navbars/WanikaniNav";
import AnkiNav from "./navbars/AnkiNav";
import BunProNav from "./navbars/BunProNav";
import { useBunProApiKey } from "../hooks/useBunProApiKey";
import OverviewNav from "./navbars/OverviewNav";
import { APP_NAMES } from "../Constants";
import { useSelectedApp } from "../hooks/useSelectedApp";
import ankiIcon from '../../assets/icons/anki-icon.png';
import bunProIcon from '../../assets/icons/bunpro-icon.png';
import wanikaniIcon from '../../assets/icons/wanikani-icon.png';
import { BarChart } from "@mui/icons-material";
import { AppStyles } from "../util/TypeUtils";

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
    { appName: APP_NAMES.overview, displayName: 'Overview', icon: BarChart, iconStyle: { color: '#21bcff' } },
    { appName: APP_NAMES.anki, displayName: 'Anki', icon: ankiIcon },
    { appName: APP_NAMES.bunpro, displayName: 'BunPro', icon: bunProIcon, iconStyle: { marginLeft: '-4px' } },
    { appName: APP_NAMES.wanikani, displayName: 'Wanikani', icon: wanikaniIcon },
]

function AppNav() {
    const { selectedApp, setSelectedApp } = useSelectedApp();
    const navigate = useNavigate();
    const location = useLocation();
    const { apiKey: wanikaniApiKey } = useWanikaniApiKey();
    const { apiKey: bunProApiKey } = useBunProApiKey();
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
            <GridLegacy container style={styles.container} alignItems={'flex-end'}>
                <GridLegacy item xs={12} sm={3} md={2} lg={1}>
                    <AppSelector options={appOptions}
                        selectedApp={selectedApp}
                        setSelectedApp={setSelectedApp} />
                </GridLegacy>

                <Box sx={{ flexGrow: 1 }}>
                    {selectedApp === APP_NAMES.overview ? (<OverviewNav />) : null}
                    {selectedApp === APP_NAMES.anki ? (<AnkiNav />) : null}
                    {selectedApp === APP_NAMES.bunpro && !!bunProApiKey ? (<BunProNav />) : null}
                    {selectedApp === APP_NAMES.wanikani && !!wanikaniApiKey ? (<WanikaniNav />) : null}
                </Box>
            </GridLegacy>
        )
    );
}

export default AppNav;
