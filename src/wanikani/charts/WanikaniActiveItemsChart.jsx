import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Card, CardContent, Typography } from "@material-ui/core";
import WanikaniItemTile from "../components/WanikaniItemTile";

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

async function fetchData(apiKey) {
    const user = await WanikaniApiService.getUser(apiKey);
    const currentLevel = user.data.level;
    const subjects = (await WanikaniApiService.getSubjects(apiKey))
        .filter(subject => subject.data.level === currentLevel);

    let assignments = (await WanikaniApiService.getAssignmentsForLevel(apiKey, currentLevel)).data;
    assignments = createAssignmentMap(assignments);

    const radicals = subjects
        .filter(subject => subject.object === 'radical')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const kanji = subjects
        .filter(subject => subject.object === 'kanji')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const vocabulary = subjects
        .filter(subject => subject.object === 'vocabulary')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    return {
        radicals,
        kanji,
        vocabulary
    };
}

function WanikaniActiveItemsChart() {
    const { apiKey } = useWanikaniApiKey();
    const [data, setData] = useState({
        radicals: [],
        kanji: [],
        vocabulary: [],
    })

    useEffect(() => {
        fetchData(apiKey)
            .then(setData)
            .catch(console.error);
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'}
                    color={'textPrimary'}
                    style={{ paddingBottom: '10px' }}
                >
                    Radicals
                </Typography>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.radicals.map(subject => (
                        <WanikaniItemTile
                            key={subject.subjectId + '-radical'}
                            text={subject.characters}
                            isStarted={subject['started_at']}
                            isAvailable={subject.hasAssignment}
                            link={subject['document_url']}
                            meaning={subject.meanings.map(m => m.meaning).join(', ')}
                            srsLevel={subject['srs_stage']}
                            type={'radical'}
                        />
                    ))}
                </div>

                <Typography variant={'h5'}
                    color={'textPrimary'}
                    style={{ paddingBottom: '10px', paddingTop: '15px' }}
                >
                    Kanji
                </Typography>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.kanji.map(subject => (
                        <WanikaniItemTile
                            key={subject.subjectId + '-kaji'}
                            text={subject.characters}
                            isStarted={subject['started_at']}
                            isAvailable={subject.hasAssignment}
                            link={subject['document_url']}
                            meaning={subject.meanings.map(m => m.meaning).join(', ')}
                            srsLevel={subject['srs_stage']}
                            type={'kanji'}
                        />
                    ))}

                </div>

                <Typography variant={'h5'}
                    color={'textPrimary'}
                    style={{ paddingBottom: '10px', paddingTop: '15px' }}
                >
                    Vocabulary
                </Typography>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.vocabulary.map(subject => (
                        <WanikaniItemTile
                            key={subject.subjectId + '-vocabulary'}
                            text={subject.characters}
                            isStarted={subject['started_at']}
                            isAvailable={subject.hasAssignment}
                            link={subject['document_url']}
                            meaning={subject.meanings.map(m => m.meaning).join(', ')}
                            srsLevel={subject['srs_stage']}
                            type={'vocabulary'}
                        />
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}

export default WanikaniActiveItemsChart;