import create from 'zustand'
import InMemoryCache from './util/InMemoryCache.js'

export const memoryCache = new InMemoryCache();

const cacheService = {
  saveSelectedApp: app => localStorage.setItem('selectedApp', app),
  loadSelectedApp: () => localStorage.getItem('selectedApp'),
};

export const useGlobalState = create(set => ({
  selectedApp: cacheService.loadSelectedApp() || 'wanikani',
  setSelectedApp: (app) => set(() => {
    cacheService.saveSelectedApp(app);
    return { selectedApp: app };
  }),
}));