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

export const RoutePaths = {

    // Wanikani
    wanikaniDashboard: '/wanikani-dashboard',
    wanikaniLogin: '/wanikani-login',
    wanikaniHistory: '/wanikani-history',
    wanikaniItems: '/wanikani-items',

    // Anki
    ankiConnect: '/anki-connect',
    ankiDashboard: '/anki-dashboard',
    ankiHistory: '/anki-history',

    // BunPro
    bunproDashboard: '/bunpro-dashboard',
    bunproHistory: '/bunpro-history',
    bunproLogin: '/bunpro-login',

    // About
    aboutPage: '/about',
};


export function AppRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.wanikaniDashboard} element={<WanikaniDashboard/>}/>
            <Route path={RoutePaths.wanikaniLogin} element={<EnterWanikaniApiKeyPage/>}/>
            <Route path={RoutePaths.wanikaniHistory} element={<WanikaniHistory/>}/>
            <Route path={RoutePaths.wanikaniItems} element={<WanikaniItems/>}/>
            <Route path={RoutePaths.bunproDashboard} element={<BunProDashboard/>}/>
            <Route path={RoutePaths.bunproLogin} element={<EnterBunProApiKeyPage/>}/>
            <Route path={RoutePaths.bunproHistory} element={<BunProHistory/>}/>
            <Route path={RoutePaths.aboutPage} element={<AboutPage/>}/>
            <Route path={RoutePaths.ankiDashboard} element={<AnkiDashboard/>}/>
            <Route path={RoutePaths.ankiHistory} element={<AnkiHistory/>}/>
            <Route path={RoutePaths.ankiConnect} element={<AnkiConnectLogin/>}/>
        </Routes>
    );
}
