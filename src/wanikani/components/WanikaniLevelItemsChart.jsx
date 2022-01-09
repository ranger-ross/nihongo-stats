import {useState, useEffect} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {Card, CardContent, Typography, Switch, FormGroup, FormControlLabel} from "@mui/material";
import WanikaniItemTile from "./WanikaniItemTile.jsx";

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


let memCache = {};

async function fetchData(level) {
    if (memCache[level]) {
        return memCache[level];
    }

    const subjects = (await WanikaniApiService.getSubjects())
        .filter(subject => subject.data.level === level);

    let assignments = (await WanikaniApiService.getAssignmentsForLevel(level)).data;
    const radicalsStarted = assignments.filter(s => s.data['subject_type'] === 'radical' && !!s.data['started_at']).length;
    const kanjiStarted = assignments.filter(s => s.data['subject_type'] === 'kanji' && !!s.data['started_at']).length;
    const vocabularyStarted = assignments.filter(s => s.data['subject_type'] === 'vocabulary' && !!s.data['started_at']).length;

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

    const data = {
        radicals,
        kanji,
        vocabulary,
        radicalsStarted,
        kanjiStarted,
        vocabularyStarted,
    };
    memCache[level] = data;
    return data;
}

function PreviousLevelSelector({selected, setSelected}) {
    return (
        <FormGroup>
            <FormControlLabel
                label={
                    <div style={{color: 'lightgray'}}>Show Previous Level</div>
                }
                control={
                    <Switch checked={selected}
                            size={'small'}
                            onChange={e => setSelected(e.target.checked)}/>
                }
            />
        </FormGroup>
    );
}

function RatioLabel({started, total}) {
    const percent = (started / total) * 100;
    const percentAsString = Number(percent.toFixed(1)).toString();
    return (
        <Typography variant={'body1'}
                    color={'textPrimary'}
                    fontSize={14}
                    style={{
                        color: 'lightgray',
                        display: 'inline-block',
                    }}
        >
            {started} / {total} ({percentAsString}%)
        </Typography>
    );
}

const defaultState = {
    radicals: [],
    kanji: [],
    vocabulary: [],
    radicalsStarted: 0,
    kanjiStarted: 0,
    vocabularyStarted: 0,
};

function WanikaniLevelItemsChart({level, showLevel, showPreviousLevelSelector, showRatios}) {
    const [isPreviousLevel, setIsPreviousLevel] = useState(false);
    const [data, setData] = useState(defaultState);

    useEffect(() => {
        let isSubscribed = true;
        fetchData(isPreviousLevel ? level - 1 : level)
            .then(d => {
                if (!isSubscribed)
                    return;
                setData(d);
            })
            .catch(console.error);
        return () => isSubscribed = false;
    }, [level, isPreviousLevel]);

    return (
        <Card>
            <CardContent>
                {showLevel ? (
                    <Typography variant={'h5'}
                                color={'textPrimary'}
                                style={{paddingBottom: '10px'}}
                    >
                        Level {level}
                    </Typography>
                ) : null}

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <Typography variant={'h5'}
                                color={'textPrimary'}
                                style={{paddingBottom: '10px'}}
                    >
                        Radicals {showRatios ? (
                        <RatioLabel
                            started={data.radicalsStarted}
                            total={data.radicals.length}
                        />
                    ) : null}
                    </Typography>
                    {showPreviousLevelSelector ? (
                        <>
                            <div style={{flexGrow: 1}}/>
                            <PreviousLevelSelector selected={isPreviousLevel} setSelected={setIsPreviousLevel}/>
                        </>
                    ) : null}
                </div>

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
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
                            style={{paddingBottom: '10px', paddingTop: '15px'}}
                >
                    Kanji {showRatios ? (
                    <RatioLabel
                        started={data.kanjiStarted}
                        total={data.kanji.length}
                    />
                ) : null}
                </Typography>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
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
                            style={{paddingBottom: '10px', paddingTop: '15px'}}
                >
                    Vocabulary {showRatios ? (
                    <RatioLabel
                        started={data.vocabularyStarted}
                        total={data.vocabulary.length}
                    />
                ) : null}
                </Typography>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
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