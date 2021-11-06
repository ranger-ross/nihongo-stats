import create from 'zustand'
import LocalStorageService from '../../service/LocalStorageService'

export const useWanikaniUser = create(set => ({
    user: LocalStorageService.loadWanikaniUser() || null,
    setUser: (user) => set(() => {
        LocalStorageService.saveWanikaniUser(user);
        return { user: user };
    }),
}));