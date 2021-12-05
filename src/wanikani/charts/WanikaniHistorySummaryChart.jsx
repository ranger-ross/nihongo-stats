import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { wanikaniColors } from '../../Constants';
import { Card, CardContent, Typography, Grid } from "@material-ui/core";
import _ from 'lodash';


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

function WanikaniHistorySummaryChart() {
    const [data, setData] = useState([]);
    const [totalsData, setTotalsData] = useState({ total: 0, radicals: 0, kanji: 0, vocabulary: 0 });

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
        return () => isSubscribed = false;
    }, []);

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }}>
                <Typography variant={'h5'} align={'center'}>
                    History Summary
                </Typography>

                <div style={{ display: 'flex' }}>
                    <Grid container style={{ maxWidth: '280px' }}>
                        <TotalLabel label={'Total Reviews'} count={totalsData.total} />
                        <TotalLabel label={'Radicals Reviews'} count={totalsData.radicals} color={wanikaniColors.blue} />
                        <TotalLabel label={'Kanji Reviews'} count={totalsData.kanji} color={wanikaniColors.pink} />
                        <TotalLabel label={'Vocabulary Reviews'} count={totalsData.vocabulary} color={wanikaniColors.purple} />
                    </Grid>

                </div>
            </CardContent>
        </Card>
    );
}

export default WanikaniHistorySummaryChart;