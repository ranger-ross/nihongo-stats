import create from 'zustand'

export const useUserPreferences = create(set => ({
    // apiKey: BunProApiService.apiKey() || null,
    // setApiKey: (apiKey) => set(() => {
    //     BunProApiService.saveApiKey(apiKey);
    //     return {apiKey: apiKey};
    // }),
}));