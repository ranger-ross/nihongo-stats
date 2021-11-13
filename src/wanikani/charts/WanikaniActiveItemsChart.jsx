import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Card, CardContent } from "@material-ui/core";
import { wanikaniColors } from "../../Constants";

const racialColor = wanikaniColors.blue;
const kanjiColor = wanikaniColors.pink;
const vocabularyColor = wanikaniColors.purple;

function ItemTile({ text, type, isStarted, isAvailable }) {
    let color = 'darkgray';
    if (isStarted) {
        switch (type) {
            case 'radical':
                color = racialColor;
                break;
            case 'kanji':
                color = kanjiColor;
                break;
            case 'vocabulary':
                color = vocabularyColor;
                break;
        }
    } else if (isAvailable) {
        color = 'gray';
    }

    return (
        <div style={{ color: color, width: 'fit-content' }}>
            {text}
        </div>
    );
}

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
                Radicals
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.radicals.map(radical => (
                        <ItemTile key={radical.subjectId}
                            text={radical.characters}
                            isStarted={radical['started_at']}
                            isAvailable={radical.hasAssignment}
                            type={'radical'}
                        />
                    ))}
                </div>

                Kanji
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.kanji.map(kanji => (
                        <ItemTile key={kanji.subjectId}
                            text={kanji.characters}
                            isStarted={kanji['started_at']}
                            isAvailable={kanji.hasAssignment}
                            type={'kanji'}
                        />
                    ))}

                </div>

                Vocabulary
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.vocabulary.map(vocabulary => (
                        <ItemTile key={vocabulary.subjectId}
                            text={vocabulary.characters}
                            isStarted={vocabulary['started_at']}
                            isAvailable={vocabulary.hasAssignment}
                            type={'vocabulary'}
                        />
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}

export default WanikaniActiveItemsChart;