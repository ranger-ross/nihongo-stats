import create, {SetState} from 'zustand'
import {AppNames} from "../Constants";
import {State} from "zustand/vanilla";

const storageService = {
    saveSelectedApp: (app: string) => localStorage.setItem('selectedApp', app),
    loadSelectedApp: () => localStorage.getItem('selectedApp'),
};

export const useSelectedApp = create<State>((set: SetState<State>) => ({
    selectedApp: storageService.loadSelectedApp() || AppNames.overview,
    setSelectedApp: (app: string) => set(() => {
        storageService.saveSelectedApp(app);
        return {selectedApp: app};
    }),
}));
