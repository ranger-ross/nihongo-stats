import create, {SetState} from 'zustand'
import BunProApiService from "../bunpro/service/BunProApiService";
import {State} from "zustand/vanilla";

export const useBunProApiKey = create((set: SetState<State>) => ({
    apiKey: BunProApiService.apiKey() || null,
    setApiKey: (apiKey: string) => set(() => {
        BunProApiService.saveApiKey(apiKey);
        return {apiKey: apiKey};
    }),
}));
