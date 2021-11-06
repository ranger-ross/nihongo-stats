import create from 'zustand'
import LocalStorageService from './service/LocalStorageService'

export const useGlobalState = create(set => ({
  selectedApp: LocalStorageService.loadSelectedApp() || 'wanikani',
  setSelectedApp: (app) => set(() => {
    LocalStorageService.saveSelectedApp(app);
    return { selectedApp: app };
  }),
}));