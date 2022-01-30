import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import * as React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";
import {Card, CardContent, Checkbox, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import {WanikaniItemTileV2} from "./components/WanikaniItemTile.jsx";
import WanikaniApiService from "./service/WanikaniApiService.js";
import {combineAssignmentAndSubject, createAssignmentMap, isSubjectHidden} from "./service/WanikaniDataUtil.js";
import {getColorByWanikaniSrsStage} from "./service/WanikaniStyleUtil.js";

const styles = {
    container: {
        margin: '5px'
    }
};

function getWanikaniLevels() {
    return Array.from({length: 60}, (_, i) => i + 1);
}

function getWanikaniSrsStages() {
    return ['Unlocked', 'Apprentice 1', 'Apprentice 2', 'Apprentice 3', 'Apprentice 4',
        'Guru 1', 'Guru 2', 'Master', 'Enlightened', 'Burned', 'Locked'];
}


function SubjectTile({subject}) {
    return useMemo(() => (
        <WanikaniItemTileV2
            text={subject.characters || '?'}
            link={subject['document_url']}
            meaning={subject.meanings.map(m => m.meaning).join(', ')}
            srsLevel={subject['srs_stage']}
            color={getColorByWanikaniSrsStage(subject['srs_stage'])}
            size={5}
        />
    ), [subject]);
}

function ItemGrouping({title, subjects, secondaryGroupBy}) {
    const subGroups = useMemo(() => secondaryGroupBy.group(subjects), [subjects, secondaryGroupBy.key])
    return (
        <Card style={{margin: '5px'}}>
            <CardContent>

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <Typography variant={'h6'}
                                color={'textPrimary'}
                                style={{paddingBottom: '10px'}}
                    >
                        {title}
                    </Typography>
                </div>


                {secondaryGroupBy.key === groupByOptions.none.key ? (
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        {subjects?.map(subject => (
                            <SubjectTile key={subject.subjectId + '-subject'}
                                         subject={subject}
                            />
                        ))}
                    </div>
                ) : (
                    subGroups.map(group => (
                        <div key={group.title}>
                            {group.title}
                            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                {group.subjects?.map(subject => (
                                    <SubjectTile key={subject.subjectId + '-subject'}
                                                 subject={subject}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

async function fetchData() {
    const subjects = await WanikaniApiService.getSubjects();
    let assignments = await WanikaniApiService.getAllAssignments();

    assignments = createAssignmentMap(assignments);

    return subjects
        .filter(subject => !isSubjectHidden(subject))
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
}

function groupByLevel(subjects) {
    let levelsData = {};

    for (let subject of subjects) {
        if (!levelsData[subject.level]) {
            levelsData[subject.level] = [];
        }
        levelsData[subject.level].push(subject);
    }

    return getWanikaniLevels()
        .map(level => ({
            title: 'Level ' + level,
            subjects: levelsData[level] ?? []
        }))
        .filter(group => group.subjects.length > 0);
}

function groupBySrsStage(subjects) {
    let stageMap = {};

    for (let subject of subjects) {
        let srsStage = subject['srs_stage'] != 0 && !subject['srs_stage'] ? 'locked' : subject['srs_stage'];
        if (!stageMap[srsStage]) {
            stageMap[srsStage] = [];
        }
        stageMap[srsStage].push(subject);
    }

    return getWanikaniSrsStages()
        .map((stage, index) => ({
            title: stage,
            subjects: stageMap[stage === 'Locked' ? 'locked' : index] ?? []
        }))
        .filter(group => group.subjects.length > 0);
}

function filterSubjectsByType(subjects, typesToShow) {
    let lookupMap = {};

    for (let type of typesToShow) {
        lookupMap[type.toLowerCase()] = true;
    }
    return subjects.filter(subject => lookupMap[subject.subjectType.toLowerCase()]);
}

const groupByOptions = {
    none: {
        key: 'none',
        displayText: 'None',
        group: (subjects) => subjects,
    },
    level: {
        key: 'level',
        displayText: 'Level',
        group: groupByLevel,
    },
    srsStage: {
        key: 'srsStage',
        displayText: 'SRS Stage',
        group: groupBySrsStage,
    },
};

function GroupByToggle({options, groupBy, setGroupBy}) {
    return (
        <ToggleButtonGroup
            value={groupBy.key}
            size={'small'}
            exclusive
            onChange={e => setGroupBy(options.find(o => o.key === e.target.value))}
        >
            {options.map((option) => (
                <ToggleButton key={option.key}
                              value={option.key}
                >
                    {option.displayText}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}

function FilterControls({
                            primaryGroupBy,
                            setPrimaryGroupBy,
                            secondaryGroupBy,
                            setSecondaryGroupBy,
                            typesToShow,
                            setTypesToShow
                        }) {
    const groupByOptionsList = [
        groupByOptions.none,
        groupByOptions.level,
        groupByOptions.srsStage
    ];

    function onTypeChange(option) {
        let removeIndex = typesToShow.indexOf(option.toLowerCase());
        if (removeIndex === -1) {
            setTypesToShow([...typesToShow, option.toLowerCase()]);
        } else {
            typesToShow.splice(removeIndex, 1)
            setTypesToShow([...typesToShow]);
        }
    }

    return (
        <Card>
            <CardContent>
                Group By Primary
                <GroupByToggle options={groupByOptionsList}
                               groupBy={primaryGroupBy}
                               setGroupBy={setPrimaryGroupBy}
                />
                <br/>

                Group By Secondary
                <GroupByToggle options={groupByOptionsList}
                               groupBy={secondaryGroupBy}
                               setGroupBy={setSecondaryGroupBy}
                />
                <br/>

                Display Types
                {['Radical', 'Kanji', 'Vocabulary'].map((option) => (
                    <span key={option}>
                        <Checkbox checked={typesToShow.includes(option.toLowerCase())}
                                  size="small"
                                  onClick={() => onTypeChange(option)}
                        /> {option}
                    </span>
                ))}

            </CardContent>
        </Card>
    )
}

function WanikaniItems() {
    const {apiKey} = useWanikaniApiKey();
    const [subjects, setSubjects] = useState([]);
    const [primaryGroupBy, setPrimaryGroupBy] = useState(groupByOptions.srsStage);
    const [secondaryGroupBy, setSecondaryGroupBy] = useState(groupByOptions.none);
    const [typesToShow, setTypesToShow] = useState(['kanji']);

    useEffect(() => {
        fetchData().then(setSubjects)
    }, []);


    const subjectsToShow = useMemo(() => filterSubjectsByType(subjects, typesToShow), [subjects, typesToShow]);

    const data = useMemo(() => primaryGroupBy.group(subjectsToShow), [primaryGroupBy, subjectsToShow]);

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <div style={styles.container}>
                <FilterControls primaryGroupBy={primaryGroupBy}
                                setPrimaryGroupBy={setPrimaryGroupBy}
                                secondaryGroupBy={secondaryGroupBy}
                                setSecondaryGroupBy={setSecondaryGroupBy}
                                typesToShow={typesToShow}
                                setTypesToShow={setTypesToShow}
                />

                {data.map(group => (
                    <ItemGrouping key={group.title}
                                  title={group.title}
                                  subjects={group.subjects}
                                  secondaryGroupBy={secondaryGroupBy}
                    />
                ))}
            </div>
        </RequireOrRedirect>
    );
}

export default WanikaniItems;