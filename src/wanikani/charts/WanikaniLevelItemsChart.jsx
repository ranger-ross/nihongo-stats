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

function isHidden(subject) {
    return !!subject && !!subject.data && subject.data['hidden_at'];
}

async function fetchData(level) {
    const subjects = (await WanikaniApiService.getSubjects())
        .filter(subject => subject.data.level === level);

    let assignments = (await WanikaniApiService.getAssignmentsForLevel(level)).data;
    assignments = createAssignmentMap(assignments);

    const radicals = subjects
        .filter(subject => subject.object === 'radical' && !isHidden(subject))
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const kanji = subjects
        .filter(subject => subject.object === 'kanji' && !isHidden(subject))
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const vocabulary = subjects
        .filter(subject => subject.object === 'vocabulary' && !isHidden(subject))
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    return {
        radicals,
        kanji,
        vocabulary
    };
}

function WanikaniLevelItemsChart({ level, showLevel }) {
    const [data, setData] = useState({
        radicals: [],
        kanji: [],
        vocabulary: [],
    })

    useEffect(() => {
        let isSubscribed = true;
        fetchData(level)
            .then(d => {
                if (!isSubscribed)
                    return;
                setData(d);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, [level]);

    return (
        <Card>
            <CardContent>
                {showLevel ? (
                    <Typography variant={'h5'}
                        color={'textPrimary'}
                        style={{ paddingBottom: '10px' }}
                    >
                        Level {level}
                    </Typography>
                ) : null}

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
                            text={subject.characters || '?'}
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

export default WanikaniLevelItemsChart;