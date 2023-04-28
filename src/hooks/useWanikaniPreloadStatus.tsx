import {create} from 'zustand';
import {persist} from "zustand/middleware";

type WanikaniPreloadStatus = {
    status: boolean,
    setStatus: (status: boolean) => void
}

export const useWanikaniPreloadStatus = create<WanikaniPreloadStatus>()(persist(set => ({
        status: false,
        setStatus: (status: boolean) => set(() => {
            return {status: status};
        }),
    }),
    {
        name: 'wanikani-preloaded-status'
    }
));
