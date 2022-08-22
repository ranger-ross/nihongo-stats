import {Card, CardContent, CircularProgress, LinearProgress, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import BunProApiService from "../service/BunProApiService";
import {createGrammarPointsLookupMap} from "../service/BunProDataUtil";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";


async function fetchCurrentReviewProgress(grammarPoints: RawBunProGrammarPoint[]) {

    const grammarPointsMap = createGrammarPointsLookupMap(grammarPoints);
    const reviewData = await BunProApiService.getAllReviews();

    const data: { [key: string]: number } = {
        JLPT5: 0,
        JLPT4: 0,
        JLPT3: 0,
        JLPT2: 0,
        JLPT1: 0,
    };

    for (const review of reviewData.reviews) {
        const grammarPoint = grammarPointsMap[review['grammar_point_id']];
        data[grammarPoint.attributes.level] += 1;
    }

    return data;
}

function getJLPTTotals(grammarPoints: RawBunProGrammarPoint[]) {

    const data: { [key: string]: number } = {
        JLPT5: 0,
        JLPT4: 0,
        JLPT3: 0,
        JLPT2: 0,
        JLPT1: 0,
    };

    for (const grammarPoint of grammarPoints) {
        data[grammarPoint.attributes.level] += 1;
    }

    return data;
}

type FormattedJlptLevel = {
    progress: number,
    total: number,
};

type FormattedData = {
    N5: FormattedJlptLevel,
    N4: FormattedJlptLevel,
    N3: FormattedJlptLevel,
    N2: FormattedJlptLevel,
    N1: FormattedJlptLevel,
    all: FormattedJlptLevel,
    userLevel: {
        level: number,
        nextLevelXp: number,
        prevLevelXp: number,
        xp: number,
    }
};

async function fetchData() {
    const grammarPoints = await BunProApiService.getGrammarPoints();

    const currentProgress = await fetchCurrentReviewProgress(grammarPoints);
    const totals = getJLPTTotals(grammarPoints);

    function formatData(level: string) {
        return {
            progress: currentProgress[level],
            total: totals[level],
        }
    }

    const data: FormattedData = {
        N5: formatData('JLPT5'),
        N4: formatData('JLPT4'),
        N3: formatData('JLPT3'),
        N2: formatData('JLPT2'),
        N1: formatData('JLPT1'),
        all: null as any,
        userLevel: null as any
    };

    type JLPTLevels = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

    data.all = ['N5', 'N4', 'N3', 'N2', 'N1']
        .map(key => data[key as JLPTLevels])
        .reduce((previousValue, currentValue) => {
            previousValue.progress += currentValue.progress;
            previousValue.total += currentValue.total;
            return previousValue;
        }, {
            progress: 0,
            total: 0,
        })

    const userData = await BunProApiService.getUser();
    const user = userData.data['attributes'];

    data.userLevel = {
        level: user.level,
        nextLevelXp: user['next-level-xp'],
        prevLevelXp: user['prev-level-xp'],
        xp: user.xp,
    };

    return data;
}

type LevelProgressProps = {
    level: number | string,
    current: number,
    total: number,
};

function LevelProgress({level, current, total}: LevelProgressProps) {
    const [value, setValue] = useState(0);
    const percentage = (current / total) * 100;

    useEffect(() => {
        setValue(percentage);
    }, [percentage]);


    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <p>{level}</p>
            <div style={{flexGrow: 1, marginLeft: '10px', marginRight: '5px'}}>
                <LinearProgress variant="determinate" value={value}/>
            </div>
            <p style={{width: '70px', textAlign: 'right'}}>{current} / {total}</p>
        </div>
    );
}

type XpProgressProps = {
    current: number,
    total: number,
};

function XpProgress({current, total}: XpProgressProps) {
    const [value, setValue] = useState(0);
    const percentage = (current / total) * 100;

    useEffect(() => {
        setValue(percentage);
    }, [percentage]);

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{flexGrow: 1, marginLeft: '10px', marginRight: '5px'}}>
                <LinearProgress variant="determinate" value={value}/>
            </div>
        </div>
    );
}

type BunProJLPTTileProps = {
    showXpProgress: boolean
};

export function BunProJLPTTile({showXpProgress}: BunProJLPTTileProps) {

    const [data, setData] = useState<FormattedData>();

    useEffect(() => {
        let isSubscribed = true;

        fetchData()
            .then(_data => {
                if (!isSubscribed)
                    return;
                setData(_data);
            });
        return () => {
            isSubscribed = false;
        };
    }, []);

    return (
        <Card style={{minHeight: '465px'}}>
            <CardContent>

                {data && showXpProgress ? (
                    <div style={{marginBottom: '15px'}}>
                        <Typography variant={'h6'}>
                            Level {data.userLevel.level} Progress
                        </Typography>

                        <div>
                            <span style={{fontSize: 'small', marginLeft: '10px', color: 'darkgray'}}>
                                {data.userLevel.nextLevelXp - data.userLevel.xp} XP to level {data.userLevel.level + 1}
                            </span>
                            <XpProgress
                                current={data.userLevel.xp - data.userLevel.prevLevelXp}
                                total={data.userLevel.nextLevelXp - data.userLevel.prevLevelXp}
                            />
                        </div>
                    </div>
                ) : null}

                <Typography variant={'h6'}>
                    JLPT Progress
                </Typography>


                {!data ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '90%',
                        minHeight: '400px'
                    }}>
                        <CircularProgress/>
                    </div>
                ) : (
                    <>

                        <LevelProgress
                            level={'N5'}
                            current={data['N5'].progress}
                            total={data['N5'].total}
                        />


                        <LevelProgress
                            level={'N4'}
                            current={data['N4'].progress}
                            total={data['N4'].total}
                        />

                        <LevelProgress
                            level={'N3'}
                            current={data['N3'].progress}
                            total={data['N3'].total}
                        />

                        <LevelProgress
                            level={'N2'}
                            current={data['N2'].progress}
                            total={data['N2'].total}
                        />

                        <LevelProgress
                            level={'N1'}
                            current={data['N1'].progress}
                            total={data['N1'].total}
                        />

                        <div style={{marginTop: '15px'}}>
                            <LevelProgress
                                level={'All'}
                                current={data['all'].progress}
                                total={data['all'].total}
                            />
                        </div>


                    </>
                )}

            </CardContent>
        </Card>
    );
}
