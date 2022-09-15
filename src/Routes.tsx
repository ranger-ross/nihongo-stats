import React from "react";
import {Route, Routes} from "react-router-dom";
import {APP_NAMES} from "./Constants";

const AnkiDashboard = React.lazy(() => import("./anki/AnkiDashboard"));
const AnkiConnectLogin = React.lazy(() => import("./anki/AnkiConnectLogin"));
const AnkiHistory = React.lazy(() => import("./anki/AnkiHistory"));
const AboutPage = React.lazy(() => import("./about/AboutPage"));
const LandingPage = React.lazy(() => import("./landing/LandingPage"));
const EnterWanikaniApiKeyPage = React.lazy(() => import("./wanikani/EnterWanikaniApiKeyPage"));
const WanikaniDashboard = React.lazy(() => import("./wanikani/WanikaniDashboard"));
const WanikaniHistory = React.lazy(() => import("./wanikani/WanikaniHistory"));
const WanikaniItems = React.lazy(() => import("./wanikani/WanikaniItems"));
const BunProDashboard = React.lazy(() => import("./bunpro/BunProDashboard"));
const EnterBunProApiKeyPage = React.lazy(() => import("./bunpro/EnterBunProApiKeyPage"));
const BunProHistory = React.lazy(() => import("./bunpro/BunProHistory"));
const OverviewDashboard = React.lazy(() => import("./overview/OverviewDashboard"));
const OverviewHistory = React.lazy(() => import("./overview/OverviewHistory"));
const NotFoundPage = React.lazy(() => import("./landing/NotFoundPage"));

export type AppRoute = {
    path: string,
    appName: string | null,
    hideNav?: boolean,
};

export const RoutePaths: { [key: string]: AppRoute } = {

    // Landing Page
    landingPage: {path: '/', hideNav: true, appName: null},

    // Overview
    overviewDashboard: {path: '/dashboard', appName: APP_NAMES.overview},
    overviewHistory: {path: '/history', appName: APP_NAMES.overview},

    // Wanikani
    wanikaniDashboard: {path: '/wanikani-dashboard', appName: APP_NAMES.wanikani},
    wanikaniLogin: {path: '/wanikani-login', appName: APP_NAMES.wanikani},
    wanikaniHistory: {path: '/wanikani-history', appName: APP_NAMES.wanikani},
    wanikaniItems: {path: '/wanikani-items', appName: APP_NAMES.wanikani},

    // Anki
    ankiConnect: {path: '/anki-connect', appName: APP_NAMES.anki},
    ankiDashboard: {path: '/anki-dashboard', appName: APP_NAMES.anki},
    ankiHistory: {path: '/anki-history', appName: APP_NAMES.anki},

    // BunPro
    bunproDashboard: {path: '/bunpro-dashboard', appName: APP_NAMES.bunpro},
    bunproHistory: {path: '/bunpro-history', appName: APP_NAMES.bunpro},
    bunproLogin: {path: '/bunpro-login', appName: APP_NAMES.bunpro},

    // About
    aboutPage: {path: '/about', appName: null},
};

export const AllRoutes = Object.keys(RoutePaths).map(key => RoutePaths[key]);

function lazyRoute(route: AppRoute, element: any) {
    return (
        <Route
            path={route.path}
            element={
                <React.Suspense fallback={<></>}>
                    {element}
                </React.Suspense>
            }
        />
    );
}

export function AppRoutes() {
    return (
        <Routes>
            {lazyRoute(RoutePaths.landingPage, <LandingPage/>)}
            {lazyRoute(RoutePaths.overviewDashboard, <OverviewDashboard/>)}
            {lazyRoute(RoutePaths.overviewHistory, <OverviewHistory/>)}
            {lazyRoute(RoutePaths.wanikaniDashboard, <WanikaniDashboard/>)}
            {lazyRoute(RoutePaths.wanikaniLogin, <EnterWanikaniApiKeyPage/>)}
            {lazyRoute(RoutePaths.wanikaniHistory, <WanikaniHistory/>)}
            {lazyRoute(RoutePaths.wanikaniItems, <WanikaniItems/>)}
            {lazyRoute(RoutePaths.bunproDashboard, <BunProDashboard/>)}
            {lazyRoute(RoutePaths.bunproLogin, <EnterBunProApiKeyPage/>)}
            {lazyRoute(RoutePaths.bunproHistory, <BunProHistory/>)}
            {lazyRoute(RoutePaths.aboutPage, <AboutPage/>)}
            {lazyRoute(RoutePaths.ankiDashboard, <AnkiDashboard/>)}
            {lazyRoute(RoutePaths.ankiHistory, <AnkiHistory/>)}
            {lazyRoute(RoutePaths.ankiConnect, <AnkiConnectLogin/>)}
            {lazyRoute({path: '*', appName: null}, <NotFoundPage/>)}
        </Routes>
    );
}

export function convertAppNameToDashboardRoute(appName: string) {
    switch (appName) {
        case APP_NAMES.overview:
            return RoutePaths.overviewDashboard
        case APP_NAMES.wanikani:
            return RoutePaths.wanikaniDashboard;
        case APP_NAMES.anki:
            return RoutePaths.ankiDashboard
        case APP_NAMES.bunpro:
            return RoutePaths.bunproDashboard
    }
}
