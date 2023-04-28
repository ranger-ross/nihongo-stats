import {create} from 'zustand'
import {persist} from "zustand/middleware";
import {APP_NAMES} from "../Constants";


type GlobalPreferences = {
    defaultDashboard: string
};

type AnkiPreferences = Record<string, never>;

type BunProPreferences = Record<string, never>;

type WanikaniPreferences = {
    showPreviousLevelByDefault: boolean
};

const globalDefaultPreferences: GlobalPreferences = {
    defaultDashboard: APP_NAMES.overview
};
const ankiDefaultPreferences: AnkiPreferences = {};
const bunProDefaultPreferences: BunProPreferences = {};
const wanikaniDefaultPreferences: WanikaniPreferences = {
    showPreviousLevelByDefault: true,
};

type UserPreferences = {
    globalPreferences: GlobalPreferences,
    updateGlobalPreferences: (preferences: GlobalPreferences) => void,

    ankiPreferences: AnkiPreferences,
    updateAnkiPreferences: (preferences: AnkiPreferences) => void,

    bunProPreferences: BunProPreferences,
    updateBunProPreferences: (preferences: BunProPreferences) => void,

    wanikaniPreferences: WanikaniPreferences,
    updateWanikaniPreferences: (preferences: WanikaniPreferences) => void,
};

export const useUserPreferences = create<UserPreferences>()(persist(
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
