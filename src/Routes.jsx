import React from "react";
import { Route, Routes } from "react-router-dom";
import WanikaniDashboard from "./wanikani/WanikaniDashboard";
import EnterWanikaniApiKeyPage from "./wanikani/EnterWanikaniApiKeyPage";
import BunProDashboard from "./bunpro/BunProDashboard";
import WanikaniHistory from "./wanikani/WanikaniHistory";
import WanikaniItems from "./wanikani/WanikaniItems";
import AboutPage from "./about/AboutPage";

export const RoutePaths = {

  // Wanikani
  wanikaniDashboard: '/wanikani-dashboard',
  wanikaniLogin: '/wanikani-login',
  wanikaniHistory: '/wanikani-history',
  wanikaniItems: '/wanikani-items',

  // BunPro
  bunproDashboard: '/bunpro-dashboard',

  // About
  aboutPage: '/about',
};


export function AppRoutes() {
  return (
    <Routes>
      <Route path={RoutePaths.wanikaniDashboard} element={<WanikaniDashboard />} />
      <Route path={RoutePaths.wanikaniLogin} element={<EnterWanikaniApiKeyPage />} />
      <Route path={RoutePaths.wanikaniHistory} element={<WanikaniHistory />} />
      <Route path={RoutePaths.wanikaniItems} element={<WanikaniItems />} />
      <Route path={RoutePaths.bunproDashboard} element={<BunProDashboard />} />
      <Route path={RoutePaths.aboutPage} element={<AboutPage />} />
    </Routes>
  );
}
