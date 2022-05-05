import create from 'zustand'
import {persist} from "zustand/middleware";
import {AppNames} from "../Constants.js";

const globalDefaultPreferences = {
    defaultDashboard: AppNames.overview
};
const ankiDefaultPreferences = {};
const bunProDefaultPreferences = {};
const wanikaniDefaultPreferences = {
    showPreviousLevelByDefault: true,
};

export const useUserPreferences = create(persist(
    (set) => ({

        globalPreferences: globalDefaultPreferences,
        updateGlobalPreferences: (preferences) => set(() => ({globalPreferences: {...preferences}})),

        ankiPreferences: ankiDefaultPreferences,
        updateAnkiPreferences: (preferences) => set(() => ({ankiPreferences: {...preferences}})),

        bunProPreferences: bunProDefaultPreferences,
        updateBunProPreferences: (preferences) => set(() => ({bunProPreferences: {...preferences}})),

        wanikaniPreferences: wanikaniDefaultPreferences,
        updateWanikaniPreferences: (preferences) => set(() => ({wanikaniPreferences: {...preferences}})),

    }),
    {
        name: 'user-preferences'
    })
);
