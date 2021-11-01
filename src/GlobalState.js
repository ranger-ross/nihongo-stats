import create from 'zustand'

export const useGlobalState = create(set => ({
  selectedApp: null,
  setSelectedApp: (app) => set(() => ({ selectedApp: app})),
}));