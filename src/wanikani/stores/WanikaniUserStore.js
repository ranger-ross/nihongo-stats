import create from 'zustand'
import WanikaniCacheService from '../service/WanikaniCacheService'

export const useWanikaniUser = create(set => ({
    user: WanikaniCacheService.loadWanikaniUser() || null,
    setUser: (user) => set(() => {
        WanikaniCacheService.saveWanikaniUser(user);
        return { user: user };
    }),
}));