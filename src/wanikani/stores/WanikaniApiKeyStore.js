import create from 'zustand'
import WanikaniCacheService from '../service/WanikaniCacheService.js'

export const useWanikaniApiKey = create(set => ({
    apiKey: WanikaniCacheService.loadWanikaniApiKey() || null,
    setApiKey: (apiKey) => set(() => {
        WanikaniCacheService.saveWanikaniApiKey(apiKey);
        return { apiKey: apiKey };
    }),
}));