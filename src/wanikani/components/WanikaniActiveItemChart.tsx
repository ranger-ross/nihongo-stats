import React, {useEffect, useRef, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import {Card, CardContent, CircularProgress, FormControlLabel, FormGroup, Switch, Typography} from "@mui/material";
import WanikaniItemTile from "./WanikaniItemTile";
import {
    combineAssignmentAndSubject,
    createAssignmentMap,
    isSubjectHidden,
    JoinedRawWKAssignmentAndSubject
} from "../service/WanikaniDataUtil";
import {getColorByWanikaniSubjectType} from "../service/WanikaniStyleUtil";
import {WanikaniColors} from "../../Constants";
import {useUserPreferences} from "../../hooks/useUserPreferences";
import {useDeviceInfo} from "../../hooks/useDeviceInfo";
import {lightenDarkenColor} from "../../util/CssUtils";
import GradientLinearProgress from "../../shared/GradientLinearProgress";
import {WanikaniSubject} from "../models/WanikaniSubject";
import {WanikaniAssignment} from "../models/WanikaniAssignment";
import {WanikaniUser} from "../models/WanikaniUser";

const styles = {
    showPreviousLevelMobile: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '-25px',
        marginRight: '-17px',
    }
};

type ActiveItemChartState = {
    isLoading: boolean,
    radicals: JoinedRawWKAssignmentAndSubject[],
    kanji: JoinedRawWKAssignmentAndSubject[],
    vocabulary: JoinedRawWKAssignmentAndSubject[],
    radicalsStarted: number,
    kanjiStarted: number,
    vocabularyStarted: number,
};

const defaultState: ActiveItemChartState = {
    isLoading: true,
    radicals: [],
    kanji: [],
    vocabulary: [],
    radicalsStarted: 0,
    kanjiStarted: 0,
    vocabularyStarted: 0,
};

const memCache: { [level: number]: ActiveItemChartState } = {};

async function fetchData(level: number) {
    if (memCache[level]) {
        return memCache[level];
    }

    const [allSubjects, assignments] = await Promise.all([
        WanikaniApiService.getSubjects(),
        WanikaniApiService.getAssignmentsForLevel(level),
    ]);

    const subjects: WanikaniSubject[] = allSubjects.filter((subject: WanikaniSubject) => subject.level === level);

    const radicalsStarted = assignments.filter((s: WanikaniAssignment) => s.subjectType === 'radical' && !!s.startedAt).length;
    const kanjiStarted = assignments.filter((s: WanikaniAssignment) => s.subjectType === 'kanji' && !!s.startedAt).length;
    const vocabularyStarted = assignments.filter((s: WanikaniAssignment) => s.subjectType === 'vocabulary' && !!s.startedAt).length;

    const assignmentMap = createAssignmentMap(assignments);

    const radicals = subjects
        .filter(subject => subject.object === 'radical' && !isSubjectHidden(subject))
        .map(s => combineAssignmentAndSubject(assignmentMap[s.id], s));
    const kanji = subjects
        .filter(subject => subject.object === 'kanji' && !isSubjectHidden(subject))
        .map(s => combineAssignmentAndSubject(assignmentMap[s.id], s));
    const vocabulary = subjects
        .filter(subject => subject.object === 'vocabulary' && !isSubjectHidden(subject))
        .map(s => combineAssignmentAndSubject(assignmentMap[s.id], s));

    const data: ActiveItemChartState = {
        isLoading: false,
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

type PreviousLevelSelectorProps = {
    selected: boolean,
    setSelected: (value: boolean) => void,
    isMobile: boolean
};

function PreviousLevelSelector({selected, setSelected, isMobile}: PreviousLevelSelectorProps) {
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

function RatioLabel({started, total}: { started: number, total: number }) {
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

function getTileColor(subject: JoinedRawWKAssignmentAndSubject) {
    if (subject.startedAt) {
        return getColorByWanikaniSubjectType(subject.subjectType);
    } else if (subject.hasAssignment) {
        return WanikaniColors.lessonGray;
    }
    return WanikaniColors.lockedGray;
}

function SubjectTile({subject, isMobile}: { subject: JoinedRawWKAssignmentAndSubject, isMobile: boolean }) {
    return (
        <WanikaniItemTile
            text={subject.characters || '?'}
            link={subject.documentUrl}
            meaning={subject.meanings.map(m => m.meaning).join(', ')}
            srsLevel={subject.srsStage}
            color={getTileColor(subject)}
            type={subject.subjectType}
            level={subject.level}
            readings={subject.readings}
            size={isMobile ? 6 : 10}
            nextReviewDate={subject.availableAt}
        />
    );
}

type WanikaniLevelItemsChartProps = {
    level: number,
    showWanikaniHeader: boolean,
};

function WanikaniLevelItemsChart({level, showWanikaniHeader = false}: WanikaniLevelItemsChartProps) {
    const {wanikaniPreferences} = useUserPreferences();
    const isFirstLoad = useRef(true);
    const [isPreviousLevel, setIsPreviousLevel] = useState(true);
    const [data, setData] = useState(defaultState);
    const {isMobile} = useDeviceInfo();

    useEffect(() => {
        let isSubscribed = true;
        const cleanUp = () => {
            isSubscribed = false;
        };

        const _isFirstLoad = isFirstLoad.current
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

                            <div style={isMobile ? styles.showPreviousLevelMobile : {}}>
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
    const [user, setUser] = useState<WanikaniUser>();
    useEffect(() => {
        let isSubscribed = true;

        WanikaniApiService.getUser()
            .then(data => {
                if (!isSubscribed)
                    return;
                setUser(data);
            })
        return () => {
            isSubscribed = false;
        };
    }, [])
    return (
        <>
            {!!user ? (
                <WanikaniLevelItemsChart
                    level={user.level}
                    showWanikaniHeader={showWanikaniHeader}
                />
            ) : null}
        </>
    )
}

export default WanikaniActiveItemsChart;
