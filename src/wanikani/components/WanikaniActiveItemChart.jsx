import React, {useEffect, useRef, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";
import {Card, CardContent, CircularProgress, FormControlLabel, FormGroup, Switch, Typography} from "@mui/material";
import WanikaniItemTile from "./WanikaniItemTile.jsx";
import {combineAssignmentAndSubject, isSubjectHidden} from "../service/WanikaniDataUtil.js";
import {getColorByWanikaniSubjectType} from "../service/WanikaniStyleUtil.js";
import {BunProColors, WanikaniColors} from "../../Constants.js";
import {useUserPreferences} from "../../hooks/useUserPreferences.jsx";
import {useDeviceInfo} from "../../hooks/useDeviceInfo.jsx";
import {lightenDarkenColor} from "../../util/CssUtils.js";
import GradientLinearProgress from "../../shared/GradientLinearProgress.jsx";

const styles = {
    showPreviousLevelMobile: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '-25px',
        marginRight: '-17px',
    }
};

const defaultState = {
    isLoading: true,
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

function PreviousLevelSelector({selected, setSelected, isMobile}) {
    return (
        <FormGroup>
            <FormControlLabel
                label={
                    <div style={{color: 'lightgray', fontSize: isMobile ? '12px' : '15px'}}>Show Previous Level</div>
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

function SubjectTile({subject, isMobile}) {
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
            size={isMobile ? 6 : 10}
            nextReviewDate={!!subject['available_at'] ? new Date(subject['available_at']) : null}
        />
    );
}

function WanikaniLevelItemsChart({level, showWanikaniHeader = false}) {
    const {wanikaniPreferences} = useUserPreferences();
    const isFirstLoad = useRef(true);
    const [isPreviousLevel, setIsPreviousLevel] = useState(true);
    const [data, setData] = useState(defaultState);
    const {isMobile} = useDeviceInfo();

    useEffect(() => {
        let isSubscribed = true;
        const cleanUp = () => isSubscribed = false;

        let _isFirstLoad = isFirstLoad.current
        isFirstLoad.current = false;

        if (_isFirstLoad && !wanikaniPreferences.showPreviousLevelByDefault) {
            setIsPreviousLevel(false);
            return cleanUp;
        }

        fetchData(level > 1 && isPreviousLevel ? level - 1 : level)
            .then(d => {
                if (!isSubscribed)
                    return;

                if (wanikaniPreferences.showPreviousLevelByDefault &&
                    _isFirstLoad &&
                    d.radicalsStarted === d.radicals.length &&
                    d.kanjiStarted === d.kanji.length &&
                    d.vocabularyStarted === d.vocabulary.length) {
                    setIsPreviousLevel(false);
                    return;
                }

                setData(d);
            })
            .catch(console.error);

        return cleanUp;
    }, [level, isPreviousLevel]);

    const percentage = data.isLoading ? 0.0 : (
        (data.radicalsStarted + data.kanjiStarted + data.vocabularyStarted) / (data.radicals.length + data.kanji.length + data.vocabulary.length)
    );

    return (
        <Card>
            <CardContent>

                <div style={{position: 'relative', top: -16, left: -16, width: `calc(100% + 32px)`}}>
                    <GradientLinearProgress variant="determinate"
                                            value={percentage * 100}
                                            lineStartColor={lightenDarkenColor(WanikaniColors.pink, 30)}
                                            lineEndColor={lightenDarkenColor(WanikaniColors.pink, -30)}
                                            backgroundLineColor={lightenDarkenColor(WanikaniColors.pink, -120)}
                    />
                </div>

                {showWanikaniHeader ? (
                    <Typography variant={'h5'}
                                color={'textPrimary'}
                                style={{marginBottom: '15px'}}
                    >
                        Wanikani Items
                    </Typography>
                ) : null}

                {data.isLoading ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%'}}>
                        <CircularProgress/>
                    </div>
                ) : (
                    <>
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            <Typography variant={'h5'}
                                        color={'textPrimary'}
                            >
                                Radicals <RatioLabel started={data.radicalsStarted} total={data.radicals.length}/>
                            </Typography>

                            <div style={{flexGrow: 1, textAlign: isMobile ? 'right' : 'center'}}>
                                <Typography variant={'body1'}
                                            style={{color: 'lightgray'}}
                                >
                                    Level {isPreviousLevel ? level - 1 : level}
                                </Typography>
                            </div>

                            <div style={isMobile ? styles.showPreviousLevelMobile : null}>
                                <PreviousLevelSelector
                                    selected={isPreviousLevel}
                                    setSelected={setIsPreviousLevel}
                                    isMobile={isMobile}
                                />
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {data.radicals.map(subject => (
                                <SubjectTile key={subject.subjectId + '-radicals'}
                                             subject={subject}
                                             isMobile={isMobile}
                                />
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
                                <SubjectTile key={subject.subjectId + '-kanji'}
                                             subject={subject}
                                             isMobile={isMobile}
                                />
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
                                <SubjectTile key={subject.subjectId + '-vocab'}
                                             subject={subject}
                                             isMobile={isMobile}
                                />
                            ))}
                        </div>
                    </>
                )}

            </CardContent>
        </Card>
    );
}

function WanikaniActiveItemsChart({showWanikaniHeader = false}) {
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
                    showWanikaniHeader={showWanikaniHeader}
                />
            ) : null}
        </>
    )
}

export default WanikaniActiveItemsChart;
