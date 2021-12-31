import {Card, CardContent, CircularProgress, LinearProgress, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import BunProApiService from "../service/BunProApiService.js";
import {createGrammarPointsLookupMap} from "../service/BunProDataUtil.js";


async function fetchCurrentReviewProgress(grammarPoints) {

    const grammarPointsMap = createGrammarPointsLookupMap(grammarPoints);
    const reviewData = await BunProApiService.getAllReviews();

    let data = {
        JLPT5: 0,
        JLPT4: 0,
        JLPT3: 0,
        JLPT2: 0,
        JLPT1: 0,
    };

    for (const review of reviewData.reviews) {
        const grammarPoint = grammarPointsMap[review['grammar_point_id']];
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

    let data = {
        N5: formatData('JLPT5'),
        N4: formatData('JLPT4'),
        N3: formatData('JLPT3'),
        N2: formatData('JLPT2'),
        N1: formatData('JLPT1'),
    };

    data.all = Object.keys(data)
        .map(key => data[key])
        .reduce((previousValue, currentValue) => {
            previousValue.progress += currentValue.progress;
            previousValue.total += currentValue.total;
            return previousValue;
        }, {
            progress: 0,
            total: 0,
        })

    return data;
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