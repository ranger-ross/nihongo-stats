import React from "react";
import {Route, Routes} from "react-router-dom";
import {AppNames} from "./Constants";

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

function AppRoute(path, appName, hideNav = false) {
    return {
        path: path,
        appName: appName,
        hideNav: hideNav,
    };
}

export const RoutePaths = {

    // Landing Page
    landingPage: new AppRoute('/', null, true),

    // Overview
    overviewDashboard: new AppRoute('/dashboard', AppNames.overview),
    overviewHistory: new AppRoute('/history', AppNames.overview),

    // Wanikani
    wanikaniDashboard: new AppRoute('/wanikani-dashboard', AppNames.wanikani),
    wanikaniLogin: new AppRoute('/wanikani-login', AppNames.wanikani),
    wanikaniHistory: new AppRoute('/wanikani-history', AppNames.wanikani),
    wanikaniItems: new AppRoute('/wanikani-items', AppNames.wanikani),

    // Anki
    ankiConnect: new AppRoute('/anki-connect', AppNames.anki),
    ankiDashboard: new AppRoute('/anki-dashboard', AppNames.anki),
    ankiHistory: new AppRoute('/anki-history', AppNames.anki),

    // BunPro
    bunproDashboard: new AppRoute('/bunpro-dashboard', AppNames.bunpro),
    bunproHistory: new AppRoute('/bunpro-history', AppNames.bunpro),
    bunproLogin: new AppRoute('/bunpro-login', AppNames.bunpro),

    // About
    aboutPage: new AppRoute('/about'),
};

export const AllRoutes = Object.keys(RoutePaths).map(key => RoutePaths[key]);

function lazyRoute(route, element, exact = false) {
    return (
        <Route path={route.path} element={
            <React.Suspense fallback={<></>}>
                {element}
            </React.Suspense>
        } exact={exact}/>
    );
}

export function AppRoutes() {
    return (
        <Routes>
            {lazyRoute(RoutePaths.landingPage, <LandingPage/>, true)}
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
            {lazyRoute({path: '*'}, <NotFoundPage/>)}
        </Routes>
    );
}

export function convertAppNameToDashboardRoute(appName) {
    switch (appName) {
        case AppNames.overview:
            return RoutePaths.overviewDashboard
        case AppNames.wanikani:
            return RoutePaths.wanikaniDashboard;
        case AppNames.anki:
            return RoutePaths.ankiDashboard
        case AppNames.bunpro:
            return RoutePaths.bunproDashboard
    }
}
