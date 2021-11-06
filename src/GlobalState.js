import create from 'zustand'

export const useGlobalState = create(set => ({
  selectedApp: 'wanikani',
  setSelectedApp: (app) => set(() => ({ selectedApp: app})),
}));