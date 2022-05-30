import create from 'zustand'
import WanikaniApiService from '../wanikani/service/WanikaniApiService.ts';

export const useWanikaniApiKey = create(set => ({
    apiKey: WanikaniApiService.apiKey() || null,
    setApiKey: (apiKey) => set(() => {
        WanikaniApiService.saveApiKey(apiKey);
        return {apiKey: apiKey};
    }),
}));
