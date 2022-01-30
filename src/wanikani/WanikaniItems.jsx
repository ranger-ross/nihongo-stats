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

function ItemGrouping({title, subjects}) {
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


                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {subjects?.map(subject => (
                        <SubjectTile key={subject.subjectId + '-subject'}
                                     subject={subject}
                        />
                    ))}
                </div>
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

    return getWanikaniLevels().map(level => ({
        title: 'Level ' + level,
        subjects: levelsData[level] ?? []
    }));
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

    return getWanikaniSrsStages().map((stage, index) => ({
        title: stage,
        subjects: stageMap[stage === 'Locked' ? 'locked' : index]
    }));
}

function filterSubjectsByType(subjects, typesToShow) {
    let lookupMap = {};

    for (let type of typesToShow) {
        lookupMap[type.toLowerCase()] = true;
    }
    return subjects.filter(subject => lookupMap[subject.subjectType.toLowerCase()]);
}

const groupByOptions = {
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

function FilterControls({groupBy, setGroupBy, typesToShow, setTypesToShow}) {
    const groupByOptionsList = [
        groupByOptions.level,
        groupByOptions.srsStage
    ];

    const onTypeChange = useCallback((option) => {
        let removeIndex = typesToShow.indexOf(option.toLowerCase());
        if (removeIndex === -1) {
            setTypesToShow([...typesToShow, option.toLowerCase()]);
        } else {
            typesToShow.splice(removeIndex, 1)
            setTypesToShow([...typesToShow]);
        }
    }, [typesToShow, setTypesToShow]);


    return (
        <Card>
            <CardContent>
                Group By
                <ToggleButtonGroup
                    value={groupBy.key}
                    size={'small'}
                    exclusive
                    onChange={e => setGroupBy(groupByOptionsList.find(o => o.key === e.target.value))}
                >
                    {groupByOptionsList.map((option) => (
                        <ToggleButton key={option.key}
                                      value={option.key}
                        >
                            {option.displayText}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <br/>

                Display Types
                {['Radical', 'Kanji', 'Vocabulary'].map((option) => (
                    <>
                        <Checkbox key={option}
                                  checked={typesToShow.includes(option.toLowerCase())}
                                  size="small"
                                  onClick={e => onTypeChange(option)}
                        /> {option}
                    </>
                ))}

            </CardContent>
        </Card>
    )
}

function WanikaniItems() {
    const {apiKey} = useWanikaniApiKey();
    const [subjects, setSubjects] = useState([]);
    const [groupBy, setGroupBy] = useState(groupByOptions.srsStage);
    const [typesToShow, setTypesToShow] = useState(['kanji']);

    useEffect(() => {
        fetchData().then(setSubjects)
    }, []);


    const subjectsToShow = useMemo(() => filterSubjectsByType(subjects, typesToShow), [subjects, typesToShow]);

    const data = useMemo(() => groupBy.group(subjectsToShow), [groupBy, subjectsToShow]);

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <div style={styles.container}>
                <FilterControls groupBy={groupBy}
                                setGroupBy={setGroupBy}
                                typesToShow={typesToShow}
                                setTypesToShow={setTypesToShow}
                />

                {data.map(group => (
                    <ItemGrouping key={group.title}
                                  title={group.title}
                                  subjects={group.subjects}
                    />
                ))}
            </div>
        </RequireOrRedirect>
    );
}

export default WanikaniItems;