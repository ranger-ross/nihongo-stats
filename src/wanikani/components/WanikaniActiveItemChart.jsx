import {useState, useEffect, useRef} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {Card, CardContent, Typography, Switch, FormGroup, FormControlLabel} from "@mui/material";
import WanikaniItemTile from "./WanikaniItemTile.jsx";
import {combineAssignmentAndSubject, isSubjectHidden} from "../service/WanikaniDataUtil.js";
import {getColorByWanikaniSubjectType} from "../service/WanikaniStyleUtil.js";
import {WanikaniColors} from "../../Constants.js";

const defaultState = {
    radicals: [],
    kanji: [],
    vocabulary: [],
    radicalsStarted: 0,
    kanjiStarted: 0,
    vocabularyStarted: 0,
};

let memCache = {};

function createAssignmentMap(subjects) {
    let map = {};

    for (const subject of subjects) {
        map[subject.data['subject_id']] = subject;
    }

    return map;
}

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
        .filter(subject => subject.object === 'radical' && !isSubjectHidden(subject))
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const kanji = subjects
        .filter(subject => subject.object === 'kanji' && !isSubjectHidden(subject))
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const vocabulary = subjects
        .filter(subject => subject.object === 'vocabulary' && !isSubjectHidden(subject))
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

function getTileColor(subject) {
    if (subject['started_at']) {
        return getColorByWanikaniSubjectType(subject.subjectType);
    } else if (subject.hasAssignment) {
        return WanikaniColors.lessonGray;
    }
    return WanikaniColors.lockedGray;
}

function SubjectTile({subject}) {
    return (
        <WanikaniItemTile
            text={subject.characters || '?'}
            link={subject['document_url']}
            meaning={subject.meanings.map(m => m.meaning).join(', ')}
            srsLevel={subject['srs_stage']}
            color={getTileColor(subject)}
            type={subject.subjectType}
            level={subject.level}
            readings={subject.readings}
            nextReviewDate={!!subject['available_at'] ? new Date(subject['available_at']) : null}
        />
    );
}

function WanikaniLevelItemsChart({level}) {
    const isFirstLoad = useRef(true);
    const [isPreviousLevel, setIsPreviousLevel] = useState(true);
    const [data, setData] = useState(defaultState);

    useEffect(() => {
        let isSubscribed = true;

        let _isFirstLoad = isFirstLoad.current
        isFirstLoad.current = false;

        fetchData(level > 1 && isPreviousLevel ? level - 1 : level)
            .then(d => {
                if (!isSubscribed)
                    return;

                if (_isFirstLoad &&
                    d.radicalsStarted === d.radicals.length &&
                    d.kanjiStarted === d.kanji.length &&
                    d.vocabularyStarted === d.vocabulary.length) {
                    setIsPreviousLevel(false);
                    return;
                }

                setData(d);
            })
            .catch(console.error);

        return () => isSubscribed = false;
    }, [level, isPreviousLevel]);

    return (
        <Card>
            <CardContent>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <Typography variant={'h5'}
                                color={'textPrimary'}
                                style={{paddingBottom: '10px'}}
                    >
                        Radicals <RatioLabel started={data.radicalsStarted} total={data.radicals.length}/>
                    </Typography>

                    <div style={{flexGrow: 1, textAlign: 'center'}}>
                        <Typography variant={'body1'}
                                    style={{color: 'lightgray'}}
                        >
                            Level {isPreviousLevel ? level - 1 : level}
                        </Typography>
                    </div>

                    <PreviousLevelSelector
                        selected={isPreviousLevel}
                        setSelected={setIsPreviousLevel}
                    />
                </div>

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {data.radicals.map(subject => (
                        <SubjectTile key={subject.subjectId + '-radicals'} subject={subject}/>
                    ))}
                </div>

                <Typography variant={'h5'}
                            color={'textPrimary'}
                            style={{paddingBottom: '10px', paddingTop: '15px'}}
                >
                    Kanji <RatioLabel started={data.kanjiStarted} total={data.kanji.length}/>
                </Typography>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {data.kanji.map(subject => (
                        <SubjectTile key={subject.subjectId + '-kanji'} subject={subject}/>
                    ))}

                </div>

                <Typography variant={'h5'}
                            color={'textPrimary'}
                            style={{paddingBottom: '10px', paddingTop: '15px'}}
                >
                    Vocabulary <RatioLabel started={data.vocabularyStarted} total={data.vocabulary.length}/>
                </Typography>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {data.vocabulary.map(subject => (
                        <SubjectTile key={subject.subjectId + '-vocab'} subject={subject}/>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}

function WanikaniActiveItemsChart() {
    const [user, setUser] = useState();
    useEffect(() => {
        let isSubscribed = true;

        WanikaniApiService.getUser()
            .then(data => {
                if (!isSubscribed)
                    return;
                setUser(data);
            })
        return () => isSubscribed = false;
    }, [])
    return (
        <>
            {!!user ? (
                <WanikaniLevelItemsChart
                    level={user.data.level}
                />
            ) : null}
        </>
    )
}

export default WanikaniActiveItemsChart;