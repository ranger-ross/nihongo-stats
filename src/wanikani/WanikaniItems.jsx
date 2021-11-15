import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import { Card, CardContent, Typography, ButtonGroup, Button, Box } from "@material-ui/core";
import { useState, useEffect } from "react";
import WanikaniApiService from "./service/WanikaniApiService";
import WanikaniItemTile from "./components/WanikaniItemTile";

const useStyles = makeStyles({
    container: {
        margin: '5px'
    }
});

function createAssignmentMap(subjects) {
    let map = {};

    for (const subject of subjects) {
        map[subject.data['subject_id']] = subject;
    }

    return map;
}

function combineAssignmentAndSubject(assignment, subject) {
    return {
        ...subject.data,
        ...assignment?.data,
        hasAssignment: !!assignment,
        subjectId: subject.id,
    };
}

function sortByLevel(a, b) {
    if (a.level < b.level) {
        return -1;
    }
    if (a.level > b.level) {
        return 1;
    }
    return 0;
}

async function fetchData(apiKey) {
    const subjects = await WanikaniApiService.getSubjects(apiKey);

    let assignments = (await WanikaniApiService.getAllAssignments(apiKey));
    assignments = createAssignmentMap(assignments);

    const radicals = subjects
        .filter(subject => subject.object === 'radical')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s))
        .sort(sortByLevel);
    const kanji = subjects
        .filter(subject => subject.object === 'kanji')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s))
        .sort(sortByLevel);
    const vocabulary = subjects
        .filter(subject => subject.object === 'vocabulary')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s))
        .sort(sortByLevel);
    return {
        radicals,
        kanji,
        vocabulary
    };
}

function WanikaniItems() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();
    const [data, setData] = useState({ radicals: [], kanji: [], vocabulary: [] });
    const [type, setType] = useState('Kanji');

    useEffect(() => {
        fetchData(apiKey)
            .then(setData)
            .catch(console.error);
    }, [])

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            <Card>
                <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                        <ButtonGroup variant="outlined" color={'primary'} >
                            <Button variant={type === 'Radicals' ? 'contained' : null} onClick={() => setType('Radicals')}>Radicals</Button>
                            <Button variant={type === 'Kanji' ? 'contained' : null} onClick={() => setType('Kanji')}>Kanji</Button>
                            <Button variant={type === 'Vocabulary' ? 'contained' : null} onClick={() => setType('Vocabulary')}>Vocabulary</Button>
                        </ButtonGroup>
                    </div>

                    <Typography variant={'h5'}
                        color={'textPrimary'}
                        style={{ paddingBottom: '10px' }}
                    >
                        {type}
                    </Typography>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {data[type.toLowerCase()].map(subject => (
                            <WanikaniItemTile
                                key={subject.subjectId}
                                text={subject.characters}
                                isStarted={subject['started_at']}
                                isAvailable={subject.hasAssignment}
                                link={subject['document_url']}
                                meaning={subject.meanings.map(m => m.meaning).join(', ')}
                                srsLevel={subject['srs_stage']}
                                type={type.toLowerCase() == 'radicals' ? 'radical' : type.toLowerCase()}
                            />
                        ))}
                    </div>

                </CardContent>
            </Card>

        </div>
    );
}

export default WanikaniItems;