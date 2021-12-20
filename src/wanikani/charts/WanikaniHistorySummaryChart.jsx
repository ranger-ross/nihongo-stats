import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { wanikaniColors } from '../../Constants';
import { Card, CardContent, Typography, Grid } from "@mui/material";
import {sortAndGetMedian} from "../../util/MathUtils";


function createSubjectMap(subjects) {
    let map = {};
    for (const subject of subjects) {
        map[subject.id] = subject;
    }
    return map;
}

async function fetchData() {
    const reviews = await WanikaniApiService.getReviews();
    const subjects = createSubjectMap(await WanikaniApiService.getSubjects());
    let data = [];
    for (const review of reviews) {
        data.push({
            review: review,
            subject: subjects[review.data['subject_id']]
        });
    }
    return data;
}

function numberWithCommas(x) {
    if (isNaN(x) || x === '')
        return '';
    return parseFloat(x).toLocaleString();
}

function TotalLabel({ label, count, color }) {
    return (
        <>
            <Grid item xs={6}>{label}: </Grid>
            <Grid item xs={6}>
                <strong style={{ color: color, textShadow: '1px 1px 3px #000000aa' }}>
                    {numberWithCommas(count)}
                </strong>
            </Grid>
        </>
    );
}

function DaysAndHoursLabel({ label, milliseconds }) {
    const days = millisecondsToDays(milliseconds);
    const hours = millisecondsToHours(milliseconds - (days * 1000 * 3600 * 24));
    return (
        <>
            <Grid item xs={6}>{label}: </Grid>
            <Grid item xs={6}>
                <strong style={{ textShadow: '1px 1px 3px #000000aa' }}>
                    {days} Days {hours} Hours
                </strong>
            </Grid>
        </>
    );
}

function millisecondsToDays(ms) {
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function millisecondsToHours(ms) {
    return Math.floor(ms / (1000 * 60 * 60));
}

function WanikaniHistorySummaryChart() {
    const [data, setData] = useState([]);
    const [totalsData, setTotalsData] = useState({ total: 0, radicals: 0, kanji: 0, vocabulary: 0 });
    const [levelData, setLevelData] = useState({ timeSinceStart: '', average: '', median: '' });

    useEffect(() => {
        let isSubscribed = true;
        fetchData()
            .then(data => {
                if (!isSubscribed)
                    return;

                setTotalsData({
                    total: data.length,
                    radicals: data.filter(r => r.subject?.object == 'radical').length,
                    kanji: data.filter(r => r.subject?.object == 'kanji').length,
                    vocabulary: data.filter(r => r.subject?.object == 'vocabulary').length,
                });

                setData(data);
            })
            .catch(console.error);

        WanikaniApiService.getUser()
            .then(user => {
                if (!isSubscribed)
                    return;
                const timeSinceStart = Date.now() - new Date(user.data['started_at']).getTime();
                setLevelData(lvlData => ({
                    ...lvlData,
                    timeSinceStart
                }));
            });

        WanikaniApiService.getLevelProgress()
            .then(levelProgressData => {
                if (!isSubscribed)
                    return;

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

                setLevelData(lvlData => ({
                    ...lvlData,
                    average: averageInMillis,
                    median: medianInMillis
                }));

            });

        return () => isSubscribed = false;
    }, []);

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <Typography variant={'h5'} align={'center'}>
                    History Summary
                </Typography>

                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Grid container style={{ maxWidth: '325px', marginTop: '10px' }}>
                        <TotalLabel label={'Total Reviews'} count={totalsData.total} />
                        <TotalLabel label={'Radicals Reviews'} count={totalsData.radicals} color={wanikaniColors.blue} />
                        <TotalLabel label={'Kanji Reviews'} count={totalsData.kanji} color={wanikaniColors.pink} />
                        <TotalLabel label={'Vocabulary Reviews'} count={totalsData.vocabulary} color={wanikaniColors.purple} />
                    </Grid>

                    <Grid container style={{ maxWidth: '350px', marginTop: '10px' }}>
                        <DaysAndHoursLabel label={'Time since start'} milliseconds={levelData.timeSinceStart} />
                        <DaysAndHoursLabel label={'Average Time per level'} milliseconds={levelData.average} />
                        <DaysAndHoursLabel label={'Median Time per level'} milliseconds={levelData.median} />
                    </Grid>

                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniHistorySummaryChart;