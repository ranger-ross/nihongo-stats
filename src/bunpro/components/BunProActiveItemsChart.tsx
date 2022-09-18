import {Card, CardContent, CircularProgress, Tooltip, Typography} from "@mui/material";
import React, {ReactNode} from "react";
import {lightenDarkenColor} from "../../util/CssUtils";
import {BUNPRO_COLORS} from "../../Constants";
import GradientLinearProgress from "../../shared/GradientLinearProgress";
import {BunProUser} from "../models/BunProUser";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import {BunProReview} from "../models/BunProReview";

type GpByLessonIdMap = { [lessonId: string]: BunProGrammarPoint[] };

function getBunProGrammarPointsGroupedByLesson(grammarPoints: BunProGrammarPoint[]) {
    const map: GpByLessonIdMap = {};
    for (const gp of grammarPoints) {
        const lessonId = gp.lessonId;
        if (!map[lessonId]) {
            map[lessonId] = [];
        }

        map[lessonId].push(gp);
    }

    for (const key of Object.keys(map)) {
        const array = map[key];
        map[key] = array.sort((a, b) => a.grammarOrder - b.grammarOrder)
    }
    return map;
}

type ReviewByGpIdMap = { [gpId: string]: BunProReview };

function getReviewsByGrammarPointId(reviews: BunProReview[]) {
    const map: ReviewByGpIdMap = {};

    for (const r of reviews) {
        map[r.grammarPointId] = r;
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
    grammarPoint: BunProGrammarPoint,
    review: BunProReview,
}

type FormattedData = {
    title: string,
    isLoading: boolean,
    data: JoinedGPReview[],
};

function getBunProOrderActiveItems(user: BunProUser, grammarPoints: BunProGrammarPoint[], reviews: BunProReview[]): FormattedData {
    const jlptLevel = user.studyLevel
    grammarPoints = grammarPoints.filter(gp => gp.level === jlptLevel);

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

const defaultData: FormattedData = {
    isLoading: true,
    data: [],
    title: ''
}

function useData(user?: BunProUser, reviews?: BunProReview[], grammarPoints?: BunProGrammarPoint[]): FormattedData {
    if (!user || !reviews || !grammarPoints)
        return defaultData;

    const path = user.primaryTextbook;
    if (path?.toLowerCase() === 'none') {
        return getBunProOrderActiveItems(user, grammarPoints, reviews);
    } else {
        // Unknown path, default to default BunPro order
        console.error('BunPro learning path not supported:', path);
        return getBunProOrderActiveItems(user, grammarPoints, reviews);
    }
}

function ValueLabel({label, value}: { label: string, value?: string | number | ReactNode | null }) {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
            <div style={{fontSize: 'large'}}>{label}</div>
            <div style={{fontSize: 'large'}}>{value}</div>
        </div>
    );
}


type GrammarPointTileProps = {
    grammarPoint: BunProGrammarPoint,
    review: BunProReview
};

function GrammarPointTile({grammarPoint, review}: GrammarPointTileProps) {
    const isStarted = !!review;
    const softWhite = '#b5b5b5';

    // Add delay to make the tooltip not appear when user quick hovers over multiple tiles
    // With this, it's a bit annoying to navigate because the tooltip gets in the way of other tiles
    const tooltipDelay = 125;

    return (
        <Tooltip
            enterDelay={tooltipDelay}
            enterNextDelay={tooltipDelay}
            title={
                <div style={{minWidth: '265px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div style={{fontSize: 'xx-large', fontWeight: 'bold'}}>{grammarPoint.title}</div>
                    </div>
                    {!!grammarPoint.meaning ? (<ValueLabel label={grammarPoint.meaning}/>) : null}
                    <br/>
                    <ValueLabel label={'JLPT'} value={grammarPoint.level.replace('JLPT', 'N')}/>
                    {review ? (
                        <>
                            <ValueLabel label={'Times Studied'} value={review.history?.length ?? 0}/>
                            <ValueLabel label={'First Studied'} value={review.startedStudyingAt?.toLocaleDateString()}/>
                            <ValueLabel label={'SRS Stage'} value={review.history?.length ?? 0}/>
                        </>
                    ) : null}
                    {grammarPoint.discourseLink ? (
                        <ValueLabel label={'Discussion'} value={
                            <a href={grammarPoint.discourseLink} target={'_blank'}>Link</a>
                        }/>
                    ) : null}
                </div>
            }
            placement={'top'}
        >
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
                {grammarPoint.title}
            </a>
        </Tooltip>
    );
}

type BunProActiveItemsChartProps = {
    showBunProHeader: boolean
    user?: BunProUser
    grammarPoints?: BunProGrammarPoint[]
    reviews?: BunProReview[]
};

function BunProActiveItemsChart({reviews, user, grammarPoints, showBunProHeader = false}: BunProActiveItemsChartProps) {
    const data = useData(user, reviews, grammarPoints);

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
