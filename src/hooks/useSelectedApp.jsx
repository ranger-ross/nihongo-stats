import create from 'zustand'
import {AppNames} from "../Constants.js";

const storageService = {
    saveSelectedApp: app => localStorage.setItem('selectedApp', app),
    loadSelectedApp: () => localStorage.getItem('selectedApp'),
};

export const useSelectedApp = create(set => ({
    selectedApp: storageService.loadSelectedApp() || AppNames.overview,
    setSelectedApp: (app) => set(() => {
        storageService.saveSelectedApp(app);
        return {selectedApp: app};
    }),
}));