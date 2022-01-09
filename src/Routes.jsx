import React from "react";
import {Route, Routes} from "react-router-dom";
import WanikaniDashboard from "./wanikani/WanikaniDashboard";
import EnterWanikaniApiKeyPage from "./wanikani/EnterWanikaniApiKeyPage";
import BunProDashboard from "./bunpro/BunProDashboard";
import WanikaniHistory from "./wanikani/WanikaniHistory";
import WanikaniItems from "./wanikani/WanikaniItems";
import AboutPage from "./about/AboutPage";
import AnkiDashboard from "./anki/AnkiDashboard";
import AnkiConnectLogin from "./anki/AnkiConnectLogin";
import AnkiHistory from "./anki/AnkiHistory";
import EnterBunProApiKeyPage from "./bunpro/EnterBunProApiKeyPage.jsx";
import BunProHistory from "./bunpro/BunProHistory.jsx";
import OverviewDashboard from "./overview/OverviewDashboard.jsx";
import OverviewHistory from "./overview/OverviewHistory.jsx";
import {AppNames} from "./Constants.js";

function AppRoute(path, appName) {
    return {
        path: path,
        appName: appName
    };
}

export const RoutePaths = {

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


export function AppRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.overviewDashboard.path} element={<OverviewDashboard/>}/>
            <Route path={RoutePaths.overviewHistory.path} element={<OverviewHistory/>}/>
            <Route path={RoutePaths.wanikaniDashboard.path} element={<WanikaniDashboard/>}/>
            <Route path={RoutePaths.wanikaniLogin.path} element={<EnterWanikaniApiKeyPage/>}/>
            <Route path={RoutePaths.wanikaniHistory.path} element={<WanikaniHistory/>}/>
            <Route path={RoutePaths.wanikaniItems.path} element={<WanikaniItems/>}/>
            <Route path={RoutePaths.bunproDashboard.path} element={<BunProDashboard/>}/>
            <Route path={RoutePaths.bunproLogin.path} element={<EnterBunProApiKeyPage/>}/>
            <Route path={RoutePaths.bunproHistory.path} element={<BunProHistory/>}/>
            <Route path={RoutePaths.aboutPage.path} element={<AboutPage/>}/>
            <Route path={RoutePaths.ankiDashboard.path} element={<AnkiDashboard/>}/>
            <Route path={RoutePaths.ankiHistory.path} element={<AnkiHistory/>}/>
            <Route path={RoutePaths.ankiConnect.path} element={<AnkiConnectLogin/>}/>
        </Routes>
    );
}
