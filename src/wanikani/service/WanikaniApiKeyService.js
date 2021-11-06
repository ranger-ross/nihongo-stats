import create from 'zustand'
import LocalStorageService from '../../service/LocalStorageService'

export const useWanikaniApiKey = create(set => ({
    apiKey: LocalStorageService.loadWanikaniApiKey() || null,
    setApiKey: (apiKey) => set(() => {
        LocalStorageService.saveWanikaniApiKey(apiKey);
        return { apiKey: apiKey };
    }),
}));