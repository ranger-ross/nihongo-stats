import create from 'zustand'
import {AppNames} from "../Constants";

const storageService = {
    saveSelectedApp: (app: string) => localStorage.setItem('selectedApp', app),
    loadSelectedApp: () => localStorage.getItem('selectedApp'),
};

type SelectedApp = {
    selectedApp: string,
    setSelectedApp: (app: string) => void
};

export const useSelectedApp = create<SelectedApp>(set => ({
    selectedApp: storageService.loadSelectedApp() || AppNames.overview,
    setSelectedApp: (app: string) => set(() => {
        storageService.saveSelectedApp(app);
        return {selectedApp: app};
    }),
}));
