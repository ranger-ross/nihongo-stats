import create from 'zustand';
import {persist} from "zustand/middleware";

export const useWanikaniPreloadStatus = create(persist(set => ({
        status: false,
        setStatus: (status) => set(() => {
            return {status: status};
        }),
    }),
    {
        name: 'wanikani-preloaded-status'
    }
));
