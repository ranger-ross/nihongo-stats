import create from 'zustand';
import {persist} from "zustand/middleware";

export const useBunProPreloadStatus = create(persist(set => ({
        status: false,
        setStatus: (status) => set(() => {
            return {status: status};
        }),
    }),
    {
        name: 'bunpro-preloaded-status'
    }
));
