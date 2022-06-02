import create from 'zustand'
import {persist} from "zustand/middleware";
import {AppNames} from "../Constants";


type GlobalPreferences = {
    defaultDashboard: string
};

type AnkiPreferences = Record<string, never>;

type BunProPreferences = Record<string, never>;

type WanikaniPreferences = {
    showPreviousLevelByDefault: boolean
};

const globalDefaultPreferences: GlobalPreferences = {
    defaultDashboard: AppNames.overview
};
const ankiDefaultPreferences: AnkiPreferences = {};
const bunProDefaultPreferences: BunProPreferences = {};
const wanikaniDefaultPreferences: WanikaniPreferences = {
    showPreviousLevelByDefault: true,
};

export const useUserPreferences = create(persist(
    (set) => ({

        globalPreferences: globalDefaultPreferences,
        updateGlobalPreferences: (preferences: GlobalPreferences) => set(() => ({globalPreferences: {...preferences}})),

        ankiPreferences: ankiDefaultPreferences,
        updateAnkiPreferences: (preferences: AnkiPreferences) => set(() => ({ankiPreferences: {...preferences}})),

        bunProPreferences: bunProDefaultPreferences,
        updateBunProPreferences: (preferences: BunProPreferences) => set(() => ({bunProPreferences: {...preferences}})),

        wanikaniPreferences: wanikaniDefaultPreferences,
        updateWanikaniPreferences: (preferences: WanikaniPreferences) => set(() => ({wanikaniPreferences: {...preferences}})),

    }),
    {
        name: 'user-preferences'
    })
);
