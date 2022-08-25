import {useEffect, useState} from "react";
import {WanikaniUser} from "../wanikani/models/WanikaniUser";
import {WanikaniSubject} from "../wanikani/models/WanikaniSubject";
import {WanikaniLevelProgression} from "../wanikani/models/WanikaniLevelProgress";
import {WanikaniAssignment} from "../wanikani/models/WanikaniAssignment";
import {WanikaniReview} from "../wanikani/models/WanikaniReview";
import {WanikaniSummary} from "../wanikani/models/WanikaniSummary";
import WanikaniApiService from "../wanikani/service/WanikaniApiService";

export type WanikaniDataConfig = {
    summary?: boolean;
    user?: boolean
    subjects?: boolean
    levelProgress?: boolean
    assignments?: boolean
    reviews?: boolean
};

export function useWanikaniData(config: WanikaniDataConfig) {
    const [user, setUser] = useState<WanikaniUser>();
    const [subjects, setSubjects] = useState<WanikaniSubject[]>([]);
    const [levelProgress, setLevelProgress] = useState<WanikaniLevelProgression[]>([]);
    const [assignments, setAssignments] = useState<WanikaniAssignment[]>([]);
    const [reviews, setReviews] = useState<WanikaniReview[]>([]);
    const [summary, setSummary] = useState<WanikaniSummary>();

    const isLoading = (config.user && !user) ||
        (config.summary && !summary) ||
        (config.levelProgress && levelProgress.length === 0) ||
        (config.subjects && subjects.length === 0) ||
        (config.reviews && reviews.length === 0) ||
        (config.assignments && assignments.length === 0);

    useEffect(() => {
        let isSubscribed = true;

        if (config.user) {
            WanikaniApiService.getUser()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setUser(data);
                });
        }

        if (config.summary) {
            WanikaniApiService.getSummary()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setSummary(data);
                });
        }

        if (config.subjects) {
            WanikaniApiService.getSubjects()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setSubjects(data);
                });
        }

        if (config.levelProgress) {
            WanikaniApiService.getLevelProgress()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setLevelProgress(data);
                });
        }

        if (config.assignments) {
            WanikaniApiService.getAllAssignments()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setAssignments(data);
                });
        }

        if (config.reviews) {
            WanikaniApiService.getReviews()
                .then(data => {
                    if (!isSubscribed)
                        return;
                    setReviews(data);
                });
        }

        return () => {
            isSubscribed = false;
        };
    }, []);


    return {
        user,
        subjects,
        levelProgress,
        assignments,
        reviews,
        isLoading,
        summary,
    }
}