import {create} from 'zustand'
import BunProApiService from "../bunpro/service/BunProApiService";

type BunProApiKeyState = {
    apiKey: string | null,
    setApiKey: (apiKey: string | null) => void
};

export const useBunProApiKey = create<BunProApiKeyState>(set => ({
    apiKey: BunProApiService.apiKey() || null,
    setApiKey: (apiKey: string | null) => set(() => {
        BunProApiService.saveApiKey(apiKey);
        return {apiKey: apiKey};
    }),
}));
