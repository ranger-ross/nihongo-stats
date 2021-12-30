import create from 'zustand'
import BunProApiService from "../bunpro/service/BunProApiService.js";

export const useBunProApiKey = create(set => ({
    apiKey: BunProApiService.apiKey() || null,
    setApiKey: (apiKey) => set(() => {
        BunProApiService.saveApiKey(apiKey);
        return {apiKey: apiKey};
    }),
}));