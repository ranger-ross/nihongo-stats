import {Button, Card, CardContent, CircularProgress, LinearProgress, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import BunProApiService from "../service/BunProApiService.js";


async function getGrammarPointsDatabase(grammarPoints) {
    let map = {};
    for (const grammarPoint of grammarPoints) {
        map[grammarPoint.id] = grammarPoint;
    }
    return map;
}

async function fetchCurrentReviewProgress(grammarPoints) {

    const grammarPointsDB = await getGrammarPointsDatabase(grammarPoints);
    const reviewData = await BunProApiService.getAllReviews();

    let data = {
        JLPT5: 0,
        JLPT4: 0,
        JLPT3: 0,
        JLPT2: 0,
        JLPT1: 0,
    };

    for (const review of reviewData.reviews) {
        const grammarPoint = grammarPointsDB[review['grammar_point_id']];
        data[grammarPoint.level] += 1;
    }

    return data;
}

function getJLPTTotals(grammarPoints) {

    let data = {
        JLPT5: 0,
        JLPT4: 0,
        JLPT3: 0,
        JLPT2: 0,
        JLPT1: 0,
    };

    for (const grammarPoint of grammarPoints) {
        data[grammarPoint.level] += 1;
    }

    return data;
}

async function fetchData() {
    const grammarPoints = await BunProApiService.getGrammarPoints();

    const currentProgress = await fetchCurrentReviewProgress(grammarPoints);
    const totals = getJLPTTotals(grammarPoints);

    function formatData(level) {
        return {
            progress: currentProgress[level],
            total: totals[level],
        }
    }

    return {
        N5: formatData('JLPT5'),
        N4: formatData('JLPT4'),
        N3: formatData('JLPT3'),
        N2: formatData('JLPT2'),
        N1: formatData('JLPT1'),
    }
}

function LevelProgress({level, current, total}) {
    const percentage = (current / total) * 100;
    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <p>{level}</p>
            <div style={{flexGrow: 1, marginLeft: '10px', marginRight: '5px'}}>
                <LinearProgress variant="determinate" value={percentage}/>
            </div>
            <p style={{width: '70px', textAlign: 'right'}}>{current} / {total}</p>
        </div>
    );
}

export function BunProJLPTTile() {

    const [data, setData] = useState();

    useEffect(() => {
        let isSubscribed = true;

        fetchData()
            .then(_data => {
                if (!isSubscribed)
                    return;
                setData(_data);
            });
        return () => isSubscribed = false;
    }, []);

    return (
        <Card>
            <CardContent>

                <Typography variant={'h6'}>
                    JLPT Progress
                </Typography>


                {!data ? (
                    <CircularProgress/>
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

                    </>
                )}

                {/*{data}*/}

                {/*<Typography variant={'h5'} style={styles.welcomeText}>*/}
                {/*    Welcome {user?.username}*/}
                {/*</Typography>*/}

                {/*<div style={{display: 'flex', gap: '10px', marginTop: '10px', width: '260px'}}>*/}
                {/*    <Button variant="contained">*/}
                {/*        Lessons: {!!user ? user['new_reviews'].length : null}*/}
                {/*    </Button>*/}
                {/*</div>*/}
            </CardContent>
        </Card>
    );
}