import create from 'zustand'
import WanikaniCacheService from '../service/WanikaniCacheService'

export const useWanikaniApiKey = create(set => ({
    apiKey: WanikaniCacheService.loadWanikaniApiKey() || null,
    setApiKey: (apiKey) => set(() => {
        WanikaniCacheService.saveWanikaniApiKey(apiKey);
        return { apiKey: apiKey };
    }),
}));