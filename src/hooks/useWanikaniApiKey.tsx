import create, {SetState} from 'zustand'
import WanikaniApiService from '../wanikani/service/WanikaniApiService';

export const useWanikaniApiKey = create((set: SetState<any>) => ({
    apiKey: WanikaniApiService.apiKey() || null,
    setApiKey: (apiKey: string) => set(() => {
        WanikaniApiService.saveApiKey(apiKey);
        return {apiKey: apiKey};
    }),
}));
