import {useEffect, useState} from "react";
import {BunProUser} from "../bunpro/models/BunProUser";
import {BunProGrammarPoint} from "../bunpro/models/BunProGrammarPoint";
import BunProApiService from "../bunpro/service/BunProApiService";
import {BunProReviewsResponse} from "../bunpro/models/BunProReviewsResponse";

export function useBunProData() {
    const [user, setUser] = useState<BunProUser>();
    const [grammarPoints, setGrammarPoints] = useState<BunProGrammarPoint[]>();
    const [reviewData, setReviewData] = useState<BunProReviewsResponse>();
    const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);


    useEffect(() => {
        let isSubscribed = true;

        BunProApiService.getUser()
            .then(user => {
                if (!isSubscribed)
                    return;
                setUser(user);
            });

        BunProApiService.getGrammarPoints()
            .then(gp => {
                if (!isSubscribed)
                    return;
                setGrammarPoints(gp);
            });

        BunProApiService.getAllReviews()
            .then(resp => {
                if (!isSubscribed)
                    return;
                setReviewData(resp);
            });

        BunProApiService.getPendingReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setPendingReviewsCount(data.length);
            });

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
