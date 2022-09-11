import {useEffect} from "react";
import {BunProUser} from "../bunpro/models/BunProUser";
import {BunProGrammarPoint} from "../bunpro/models/BunProGrammarPoint";
import BunProApiService from "../bunpro/service/BunProApiService";
import {BunProReviewsResponse} from "../bunpro/models/BunProReviewsResponse";
import create from "zustand";

type LoadingScreenState = {
    user: BunProUser | undefined,
    reviews: BunProReviewsResponse | undefined
    grammarPoints: BunProGrammarPoint[] | undefined,
    pendingReviewsCount: number | undefined,

    setUser: (data: BunProUser) => void
    setReview: (data: BunProReviewsResponse) => void
    setGrammarPoints: (data: BunProGrammarPoint[]) => void
    setPendingReviewsCount: (data: number) => void
};

const useLoadingScreenState = create<LoadingScreenState>((set) => ({
    user: undefined,
    reviews: undefined,
    grammarPoints: undefined,
    pendingReviewsCount: undefined,

    setUser: (data: BunProUser) => set(() => ({user: data})),
    setReview: (data: BunProReviewsResponse) => set(() => ({reviews: data})),
    setGrammarPoints: (data: BunProGrammarPoint[]) => set(() => ({grammarPoints: data})),
    setPendingReviewsCount: (data: number) => set(() => ({pendingReviewsCount: data})),

}));

type BunProDataConfig = {
    user?: boolean,
    grammarPoints?: boolean
    reviews?: boolean,
    pendingReviews?: boolean,
};

export function useBunProData(config: BunProDataConfig) {
    const {
        user, setUser,
        reviews: reviewData, setReview: setReviewData,
        grammarPoints, setGrammarPoints,
        pendingReviewsCount, setPendingReviewsCount,
    } = useLoadingScreenState();

    useEffect(() => {
        let isSubscribed = true;

        if (config.user && !user) {
            BunProApiService.getUser()
                .then(user => {
                    if (!isSubscribed)
                        return;
                    setUser(user);
                });
        }

        if (config.grammarPoints && !grammarPoints) {
            BunProApiService.getGrammarPoints()
                .then(gp => {
                    if (!isSubscribed)
                        return;
                    setGrammarPoints(gp);
                });
        }

        if (config.reviews && !reviewData) {
            BunProApiService.getAllReviews()
                .then(resp => {
                    if (!isSubscribed)
                        return;
                    setReviewData(resp);
                });
        }

        if (config.pendingReviews && !pendingReviewsCount && pendingReviewsCount !== 0) {
            BunProApiService.getPendingReviews()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setPendingReviewsCount(data.length);
                });
        }
        return () => {
            isSubscribed = false;
        };
    }, [])


    return {
        user: user,
        grammarPoints: grammarPoints,
        reviewData: reviewData,
        pendingReviewsCount: pendingReviewsCount ?? 0
    }
}
