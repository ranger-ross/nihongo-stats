import create from 'zustand';
import {persist} from "zustand/middleware";

type BunProPreloadStatus = {
    status: boolean,
    setStatus: (status: boolean) => void
}

export const useBunProPreloadStatus = create<BunProPreloadStatus>()(persist(set => ({
        status: false,
        setStatus: (status: boolean) => set(() => {
            return {status: status};
        }),
    }),
    {
        name: 'bunpro-preloaded-status'
    }
));
