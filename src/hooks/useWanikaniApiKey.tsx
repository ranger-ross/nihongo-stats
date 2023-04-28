import {create} from 'zustand'
import WanikaniApiService from '../wanikani/service/WanikaniApiService';

type WanikaniApiKeyState = {
    apiKey: string | null,
    setApiKey: (apiKey: string | null) => void
};

export const useWanikaniApiKey = create<WanikaniApiKeyState>(set => ({
    apiKey: WanikaniApiService.apiKey() || null,
    setApiKey: (apiKey: string | null) => set(() => {
        WanikaniApiService.saveApiKey(apiKey);
        return {apiKey: apiKey};
    }),
}));
