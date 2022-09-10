import {useEffect, useState} from "react";
import {BunProUser} from "../bunpro/models/BunProUser";
import {BunProGrammarPoint} from "../bunpro/models/BunProGrammarPoint";
import BunProApiService from "../bunpro/service/BunProApiService";
import {BunProReviewsResponse} from "../bunpro/models/BunProReviewsResponse";

type BunProDataConfig = {
    user?: boolean,
    grammarPoints?: boolean
    reviews?: boolean,
    pendingReviews?: boolean,
};

export function useBunProData(config: BunProDataConfig) {
    const [user, setUser] = useState<BunProUser>();
    const [grammarPoints, setGrammarPoints] = useState<BunProGrammarPoint[]>();
    const [reviewData, setReviewData] = useState<BunProReviewsResponse>();
    const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);


    useEffect(() => {
        let isSubscribed = true;

        if (config.user) {
            BunProApiService.getUser()
                .then(user => {
                    if (!isSubscribed)
                        return;
                    setUser(user);
                });
        }

        if (config.grammarPoints) {
            BunProApiService.getGrammarPoints()
                .then(gp => {
                    if (!isSubscribed)
                        return;
                    setGrammarPoints(gp);
                });
        }

        if (config.reviews) {
            BunProApiService.getAllReviews()
                .then(resp => {
                    if (!isSubscribed)
                        return;
                    setReviewData(resp);
                });
        }

        if (config.pendingReviews) {
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
        pendingReviewsCount: pendingReviewsCount
    }
}
