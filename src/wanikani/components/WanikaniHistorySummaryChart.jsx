import {useState, useEffect} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {WanikaniColors} from '../../Constants.js';
import {Card, CardContent, Typography, Grid, CircularProgress} from "@mui/material";
import {sortAndGetMedian} from "../../util/MathUtils.js";
import {createSubjectMap} from "../service/WanikaniDataUtil.js";
import {millisToDays, millisToHours} from "../../util/DateUtils.js";
import {distinct} from "../../util/ArrayUtils.ts";

const styles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        margin: '20px',
        minHeight: '100px'
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
};

function getBurnedItems(allReviewsByType) {
    const burned = allReviewsByType.filter(review => review.review.data['ending_srs_stage'] == 9);
    return distinct(burned, review => review.subject.id);
}

async function fetchTotalsData() {
    const reviews = await WanikaniApiService.getReviews();
    const subjects = createSubjectMap(await WanikaniApiService.getSubjects());
    let data = [];
    for (const review of reviews) {
        data.push({
            review: review,
            subject: subjects[review.data['subject_id']]
        });
    }

    const radicalsTotal = data.filter(r => r.subject?.object == 'radical');
    const radicalsDistinct = distinct(radicalsTotal, review => review.subject.id);
    const radicalsBurned = getBurnedItems(radicalsTotal);

    const kanjiTotal = data.filter(r => r.subject?.object == 'kanji');
    const kanjiDistinct = distinct(kanjiTotal, review => review.subject.id);
    const kanjiBurned = getBurnedItems(kanjiTotal);

    const vocabularyTotal = data.filter(r => r.subject?.object == 'vocabulary');
    const vocabularyDistinct = distinct(vocabularyTotal, review => review.subject.id);
    const vocabularyBurned = getBurnedItems(vocabularyTotal);

    return {
        total: data.length,
        radicals: radicalsTotal.length,
        radicalsDistinct: radicalsDistinct.length,
        radicalsBurned: radicalsBurned.length,
        kanji: kanjiTotal.length,
        kanjiDistinct: kanjiDistinct.length,
        kanjiBurned: kanjiBurned.length,
        vocabulary: vocabularyTotal.length,
        vocabularyDistinct: vocabularyDistinct.length,
        vocabularyBurned: vocabularyBurned.length,
    };
}

async function fetchLevelData() {
    const [user, levelProgressData] = await Promise.all([
        WanikaniApiService.getUser(),
        WanikaniApiService.getLevelProgress()
    ]);

    const timeSinceStart = Date.now() - new Date(user.data['started_at']).getTime();

    let levelTimes = [];
    for (const level of levelProgressData.data) {
        const start = new Date(level.data['unlocked_at']).getTime();
        const end = !!level.data['passed_at'] ? new Date(level.data['passed_at']).getTime() : null;
        if (!end) {
            continue;
        }
        levelTimes.push(end - start);
    }

    const averageInMillis = levelTimes.reduce((sum, value) => sum + value) / levelTimes.length;
    const medianInMillis = sortAndGetMedian(levelTimes);

    return {
        average: averageInMillis,
        median: medianInMillis,
        timeSinceStart
    };
}

function numberWithCommas(x) {
    if (isNaN(x) || x === '')
        return '';
    return parseFloat(x).toLocaleString();
}

function TotalLabel({label, count, color}) {
    return (
        <>
            <Grid item xs={6}>{label}: </Grid>
            <Grid item xs={6}>
                <strong style={{color: color, textShadow: '1px 1px 3px #000000aa'}}>
                    {numberWithCommas(count)}
                </strong>
            </Grid>
        </>
    );
}

function DaysAndHoursLabel({label, milliseconds}) {
    const days = millisToDays(milliseconds);
    const hours = millisToHours(milliseconds - (days * 1000 * 3600 * 24));
    return (
        <>
            <Grid item xs={6}>{label}: </Grid>
            <Grid item xs={6}>
                <strong style={{textShadow: '1px 1px 3px #000000aa'}}>
                    {days} Days {hours} Hours
                </strong>
            </Grid>
        </>
    );
}


function WanikaniHistorySummaryChart() {
    const [totalsData, setTotalsData] = useState();
    const [levelData, setLevelData] = useState();

    const isLoading = !totalsData || !levelData;

    useEffect(() => {
        let isSubscribed = true;
        fetchTotalsData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setTotalsData(data);
            })
            .catch(console.error);

        fetchLevelData()
            .then(data => {
                if (!isSubscribed)
                    return;
                setLevelData(data);
            });

        return () => isSubscribed = false;
    }, []);

    return (
        <Card style={{height: '100%'}}>
            <CardContent style={{height: '100%'}}>
                <Typography variant={'h5'} align={'center'}>
                    History Summary
                </Typography>

                {isLoading ? (
                    <div style={styles.loadingContainer}>
                        <CircularProgress/>
                    </div>
                ) : (
                    <div style={styles.container}>
                        <Grid container style={{maxWidth: '310px', marginTop: '10px'}}>
                            <TotalLabel label={'Total Reviews'}
                                        count={totalsData.total}
                            />
                            <TotalLabel label={'Radicals Reviews'}
                                        count={totalsData.radicals}
                                        color={WanikaniColors.blue}
                            />
                            <TotalLabel label={'Kanji Reviews'}
                                        count={totalsData.kanji}
                                        color={WanikaniColors.pink}
                            />
                            <TotalLabel label={'Vocabulary Reviews'}
                                        count={totalsData.vocabulary}
                                        color={WanikaniColors.purple}
                            />
                        </Grid>

                        <Grid container style={{maxWidth: '275px', marginTop: '10px'}}>
                            <Grid item xs={6} style={{fontWeight: 'bold'}}>Total Lessons</Grid>
                            <Grid item xs={6}/>
                            <TotalLabel label={'Radicals'}
                                        count={totalsData.radicalsDistinct}
                                        color={WanikaniColors.blue}
                            />
                            <TotalLabel label={'Kanji'}
                                        count={totalsData.kanjiDistinct}
                                        color={WanikaniColors.pink}
                            />
                            <TotalLabel label={'Vocabulary'}
                                        count={totalsData.vocabularyDistinct}
                                        color={WanikaniColors.purple}
                            />
                        </Grid>

                        <Grid container style={{maxWidth: '275px', marginTop: '10px'}}>
                            <Grid item xs={6} style={{fontWeight: 'bold'}}>Burned Items</Grid>
                            <Grid item xs={6}/>
                            <TotalLabel label={'Radicals'}
                                        count={totalsData.radicalsBurned}
                                        color={WanikaniColors.blue}
                            />
                            <TotalLabel label={'Kanji'}
                                        count={totalsData.kanjiBurned}
                                        color={WanikaniColors.pink}
                            />
                            <TotalLabel label={'Vocabulary'}
                                        count={totalsData.vocabularyBurned}
                                        color={WanikaniColors.purple}
                            />
                        </Grid>

                        <Grid container style={{maxWidth: '350px', marginTop: '10px'}}>
                            <DaysAndHoursLabel label={'Time since start'} milliseconds={levelData.timeSinceStart}/>
                            <DaysAndHoursLabel label={'Average Time per level'} milliseconds={levelData.average}/>
                            <DaysAndHoursLabel label={'Median Time per level'} milliseconds={levelData.median}/>
                        </Grid>

                    </div>
                )}


            </CardContent>
        </Card>
    );
}

export default WanikaniHistorySummaryChart;
