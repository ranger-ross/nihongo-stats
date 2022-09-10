import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import BunProApiService from "../service/BunProApiService";
import {lightenDarkenColor} from "../../util/CssUtils";
import {BUNPRO_COLORS} from "../../Constants";
import GradientLinearProgress from "../../shared/GradientLinearProgress";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {RawBunProReview} from "../models/raw/RawBunProReview";
import {BunProUser} from "../models/BunProUser";

type GpByLessonIdMap = { [lessonId: string]: RawBunProGrammarPoint[] };

function getBunProGrammarPointsGroupedByLesson(grammarPoints: RawBunProGrammarPoint[]) {
    const map: GpByLessonIdMap = {};
    for (const gp of grammarPoints) {
        const lessonId = gp.attributes['lesson-id'];
        if (!map[lessonId]) {
            map[lessonId] = [];
        }

        map[lessonId].push(gp);
    }

    for (const key of Object.keys(map)) {
        const array = map[key];
        map[key] = array.sort((a, b) => a.attributes['grammar-order'] - b.attributes['grammar-order'])
    }
    return map;
}

type ReviewByGpIdMap = { [gpId: string]: RawBunProReview };

function getReviewsByGrammarPointId(reviews: RawBunProReview[]) {
    const map: ReviewByGpIdMap = {};

    for (const r of reviews) {
        map[r['grammar_point_id']] = r;
    }

    return map;
}

function getActiveLessonId(grammarPointsByLesson: GpByLessonIdMap, reviewsByGrammarPointId: ReviewByGpIdMap) {
    const lessons = Object.keys(grammarPointsByLesson).map(key => parseInt(key)).sort();

    for (const lessonId of lessons) {
        const grammarPoints = grammarPointsByLesson[lessonId];

        for (const gp of grammarPoints) {
            if (!reviewsByGrammarPointId[gp.id]) {
                return lessonId;
            }
        }
    }
    return lessons[lessons.length - 1];
}

type JoinedGPReview = {
    grammarPoint: RawBunProGrammarPoint,
    review: RawBunProReview,
}

type FormattedData = {
    title: string,
    isLoading: boolean,
    data: JoinedGPReview[],
};

function getBunProOrderActiveItems(user: BunProUser, grammarPoints: RawBunProGrammarPoint[], reviews: RawBunProReview[]): FormattedData {
    const jlptLevel = user.studyLevel
    grammarPoints = grammarPoints.filter(gp => gp.attributes['level'] === jlptLevel);

    const grammarPointsByLesson = getBunProGrammarPointsGroupedByLesson(grammarPoints)
    const reviewsByGrammarPointId = getReviewsByGrammarPointId(reviews);
    const activeLessonId = getActiveLessonId(grammarPointsByLesson, reviewsByGrammarPointId);
    const activeLessonGrammarPoints = grammarPointsByLesson[activeLessonId];

    const data = [];
    for (const gp of activeLessonGrammarPoints) {
        data.push({
            grammarPoint: gp,
            review: reviewsByGrammarPointId[gp.id]
        })
    }

    return {
        isLoading: false,
        data: data,
        title: `JLPT ${jlptLevel.replace('JLPT', 'N')} Lesson ${activeLessonId % 10}`
    };
}

async function fetchData(): Promise<FormattedData> {
    const user = await BunProApiService.getUser();
    const grammarPoints = await BunProApiService.getGrammarPoints();
    const reviews = (await BunProApiService.getAllReviews()).reviews;


    const path = user.primaryTextbook;
    if (path?.toLowerCase() === 'none') {
        return getBunProOrderActiveItems(user, grammarPoints, reviews);
    } else {
        // Unknown path, default to default BunPro order
        console.error('BunPro learning path not supported:', path);
        return getBunProOrderActiveItems(user, grammarPoints, reviews);
    }
}

const defaultData: FormattedData = {
    isLoading: true,
    data: [],
    title: ''
}

type GrammarPointTileProps = {
    grammarPoint: RawBunProGrammarPoint,
    review: RawBunProReview
};

function GrammarPointTile({grammarPoint, review}: GrammarPointTileProps) {
    const isStarted = !!review;
    const softWhite = '#b5b5b5';
    return (
        <a
            style={{
                background: isStarted ? 'rgb(32 32 32)' : 'rgb(45 45 45)',
                fontSize: 26,
                fontWeight: 'bold',
                padding: '10px',
                borderRadius: '10px',
                border: `solid ${softWhite}`,
                color: isStarted ? 'white' : 'rgb(115 114 114)',
                textDecoration: 'none',
            }}
            href={'https://www.bunpro.jp/grammar_points/' + grammarPoint.id}
            target="_blank" rel="noreferrer"
        >
            {grammarPoint.attributes['title']}
        </a>
    )
}

function BunProActiveItemsChart({showBunProHeader = false}) {
    const [data, setData] = useState<FormattedData>(defaultData);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setData(data)
            });
        return () => {
            isSubscribed = false;
        };
    }, [])

    const percentage = data.isLoading ? 0.0 : (
        (data.data.filter(gp => !!gp.review).length) / (data.data.length)
    );

    return (
        <Card>
            <CardContent>

                <div style={{position: 'relative', top: -16, left: -16, width: `calc(100% + 32px)`}}>
                    <GradientLinearProgress variant="determinate"
                                            value={percentage * 100}
                                            lineStartColor={lightenDarkenColor(BUNPRO_COLORS.blue, 30)}
                                            lineEndColor={lightenDarkenColor(BUNPRO_COLORS.blue, -30)}
                                            backgroundLineColor={lightenDarkenColor(BUNPRO_COLORS.blue, -120)}
                    />
                </div>

                {showBunProHeader ? (
                    <Typography variant={'h5'}
                                color={'textPrimary'}
                                style={{marginBottom: '15px'}}
                    >
                        BunPro Items
                    </Typography>
                ) : null}

                {data.isLoading ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%'}}>
                        <CircularProgress/>
                    </div>
                ) : (
                    <>
                        <Typography variant={'h5'}
                                    color={'textPrimary'}
                                    style={{marginBottom: '10px'}}
                        >
                            {data.title}
                        </Typography>


                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {data.data.map(gp => (
                                <GrammarPointTile
                                    key={gp.grammarPoint.id}
                                    grammarPoint={gp.grammarPoint}
                                    review={gp.review}
                                />
                            ))}
                        </div>


                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default BunProActiveItemsChart;
