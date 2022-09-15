import create from 'zustand'
import {APP_NAMES} from "../Constants";

const storageService = {
    saveSelectedApp: (app: string) => localStorage.setItem('selectedApp', app),
    loadSelectedApp: () => localStorage.getItem('selectedApp'),
};

type SelectedApp = {
    selectedApp: string,
    setSelectedApp: (app: string) => void
};

export const useSelectedApp = create<SelectedApp>(set => ({
    selectedApp: storageService.loadSelectedApp() || APP_NAMES.overview,
    setSelectedApp: (app: string) => set(() => {
        storageService.saveSelectedApp(app);
        return {selectedApp: app};
    }),
}));
