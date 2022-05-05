import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import BunProApiService from "../service/BunProApiService.js";

function getBunProGrammarPointsGroupedByLesson(grammarPoints) {
    let map = {};
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

function getReviewsByGrammarPointId(reviews) {
    let map = {};

    for (const r of reviews) {
        map[r['grammar_point_id']] = r;
    }

    return map;
}

function getActiveLessonId(grammarPointsByLesson, reviewsByGrammarPointId) {
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

function getBunProOrderActiveItems(user, grammarPoints, reviews) {
    const jlptLevel = user.attributes['study-level'];
    grammarPoints = grammarPoints.filter(gp => gp.attributes['level'] === jlptLevel);

    const grammarPointsByLesson = getBunProGrammarPointsGroupedByLesson(grammarPoints)
    const reviewsByGrammarPointId = getReviewsByGrammarPointId(reviews);
    const activeLessonId = getActiveLessonId(grammarPointsByLesson, reviewsByGrammarPointId);
    const activeLessonGrammarPoints = grammarPointsByLesson[activeLessonId];

    let data = [];
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

async function fetchData() {
    const user = (await BunProApiService.getUser()).data;
    const grammarPoints = await BunProApiService.getGrammarPoints();
    const reviews = (await BunProApiService.getAllReviews()).reviews;


    const path = user.attributes['primary-textbook'];
    const allowOtherPaths = false; // TODO: Remove when support is added for other paths like Genki,Tai Kim, ect
    if (!path || path === 'none' || allowOtherPaths) {
        return getBunProOrderActiveItems(user, grammarPoints, reviews);
    } else {
        console.error('Unknown path', path);
    }
}

const defaultData = {
    isLoading: true,
    data: [],
    title: ''
}

function GrammarPointTile({grammarPoint, review}) {
    const isStarted = !!review;
    const softWhite = '#b5b5b5';
    return (
        <a
            style={{
                background: 'rgb(45 45 45)',
                fontSize: 26,
                fontWeight: 'bold',
                padding: '10px',
                borderRadius: '10px',
                border: `solid ${softWhite}`,
                color: isStarted ? 'white' : softWhite,
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
    const [data, setData] = useState(defaultData);

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setData(data)
            });
        return () => isSubscribed = false;
    }, [])

    return (
        <Card>
            <CardContent>
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