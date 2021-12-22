import create from 'zustand'
import WanikaniApiService from '../wanikani/service/WanikaniApiService.js';

export const useWanikaniApiKey = create(set => ({
    apiKey: WanikaniApiService.apiKey() || null,
    setApiKey: (apiKey) => set(() => {
        WanikaniApiService.saveApiKey(apiKey);
        return { apiKey: apiKey };
    }),
}));