import create from 'zustand';

export const useWanikaniPreloadStatus = create(set => ({
    status: false,
    setStatus: (status) => set(() => {
        return { status: status };
    }),
}));