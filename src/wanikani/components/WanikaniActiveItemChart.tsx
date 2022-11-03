import React, {useEffect, useRef, useState} from "react";
import {Card, CardContent, CircularProgress, FormControlLabel, FormGroup, Switch, Typography} from "@mui/material";
import {
    combineAssignmentAndSubject,
    createAssignmentMap,
    createSubjectMap,
    isSubjectHidden,
    JoinedRawWKAssignmentAndSubject
} from "../service/WanikaniDataUtil";
import {getColorByWanikaniSubjectType} from "../service/WanikaniStyleUtil";
import {WANIKANI_COLORS} from "../../Constants";
import {useUserPreferences} from "../../hooks/useUserPreferences";
import {useDeviceInfo} from "../../hooks/useDeviceInfo";
import {lightenDarkenColor} from "../../util/CssUtils";
import GradientLinearProgress from "../../shared/GradientLinearProgress";
import {WanikaniSubject} from "../models/WanikaniSubject";
import {WanikaniAssignment} from "../models/WanikaniAssignment";
import {WanikaniUser} from "../models/WanikaniUser";
import WanikaniItemTile from "./WanikaniItemTile";

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

function getAssignmentsForCurrentLevel(
    subjects: WanikaniSubject[],
    assignments: WanikaniAssignment[],
    level: number
) {
    if (subjects.length === 0 || assignments.length === 0)
        return [];

    const sub = createSubjectMap(subjects);

    return assignments.filter(assignment => {
        const s = sub[assignment.subjectId];
        return s.level === level;
    });
}

function formatData(allSubjects: WanikaniSubject[], allAssignments: WanikaniAssignment[], level: number): ActiveItemChartState {
    const assignments = getAssignmentsForCurrentLevel(allSubjects, allAssignments, level);

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

    return {
        isLoading: false,
        radicals,
        kanji,
        vocabulary,
        radicalsStarted,
        kanjiStarted,
        vocabularyStarted,
    };
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
        return WANIKANI_COLORS.lessonGray;
    }
    return WANIKANI_COLORS.lockedGray;
}

function SubjectTile({subject, isMobile}: { subject: JoinedRawWKAssignmentAndSubject, isMobile: boolean }) {
    return (
        <WanikaniItemTile
            text={subject.characters}
            characterImages={subject.characterImages}
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

type WanikaniActiveItemsChartProps = {
    user?: WanikaniUser
    showWanikaniHeader?: boolean
    assignments: WanikaniAssignment[]
    subjects: WanikaniSubject[]
};

function WanikaniActiveItemsChart({
                                      user,
                                      showWanikaniHeader = false,
                                      subjects,
                                      assignments
                                  }: WanikaniActiveItemsChartProps) {
    const {wanikaniPreferences} = useUserPreferences();
    const isFirstLoad = useRef(true);
    const [isPreviousLevel, setIsPreviousLevel] = useState(true);
    const {isMobile} = useDeviceInfo();

    useEffect(() => {

        if (user && subjects.length > 0 && assignments.length > 0 && isFirstLoad.current) {
            if (wanikaniPreferences.showPreviousLevelByDefault && user.level > 1) {
                data = formatData(subjects, assignments, user.level - 1);

                // If everything on the previous level has been completed, show current level
                if (data.radicalsStarted === data.radicals.length &&
                    data.kanjiStarted === data.kanji.length &&
                    data.vocabularyStarted === data.vocabulary.length) {
                    setIsPreviousLevel(false);
                }
            } else {
                setIsPreviousLevel(false);
            }
            isFirstLoad.current = false;
        }

    }, []);

    let data = defaultState;
    if (user && assignments.length > 0) {
        const level = isPreviousLevel ? user.level - 1 : user.level;
        data = formatData(subjects, assignments, level);
    }


    const percentage = data.isLoading ? 0.0 : (
        (data.radicalsStarted + data.kanjiStarted + data.vocabularyStarted) / (data.radicals.length + data.kanji.length + data.vocabulary.length)
    );

    return (
        <Card>
            <CardContent>

                <div style={{position: 'relative', top: -16, left: -16, width: `calc(100% + 32px)`}}>
                    <GradientLinearProgress variant="determinate"
                                            value={percentage * 100}
                                            lineStartColor={lightenDarkenColor(WANIKANI_COLORS.pink, 30)}
                                            lineEndColor={lightenDarkenColor(WANIKANI_COLORS.pink, -30)}
                                            backgroundLineColor={lightenDarkenColor(WANIKANI_COLORS.pink, -120)}
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
                                    {user ? (
                                        <>Level {isPreviousLevel ? user.level - 1 : user.level}</>
                                    ) : null}
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

export default WanikaniActiveItemsChart;
