import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import {useEffect, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";
import {Card, CardContent, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import WanikaniItemTile, {WanikaniItemTileV2} from "./components/WanikaniItemTile.jsx";
import WanikaniApiService from "./service/WanikaniApiService.js";
import {combineAssignmentAndSubject, createAssignmentMap, isSubjectHidden} from "./service/WanikaniDataUtil.js";
import {getColorByWanikaniSrsStage} from "./service/WanikaniStyleUtil.js";
import * as React from "react";

const styles = {
    container: {
        margin: '5px'
    }
};

function getWanikaniLevels() {
    return Array.from({length: 60}, (_, i) => i + 1);
}

function getWanikaniSrsStages() {
    return ['Unlocked', 'Apprentice 1', 'Apprentice 2', 'Apprentice 3', 'Apprentice 4', 'Guru 1', 'Guru 2', 'Master', 'Enlightened', 'Burned', 'Locked'];
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
                        <WanikaniItemTileV2
                            key={subject.subjectId + '-subject'}
                            text={subject.characters || '?'}
                            link={subject['document_url']}
                            meaning={subject.meanings.map(m => m.meaning).join(', ')}
                            srsLevel={subject['srs_stage']}
                            color={getColorByWanikaniSrsStage(subject['srs_stage'])}
                            size={5}
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

function groupByLevel(subjects, typesToShow) {
    return getWanikaniLevels().map(level => ({
        title: 'Level ' + level,
        subjects: subjects.filter(subject => subject.level == level && typesToShow.includes(subject.subjectType))
    }));
}

function groupBySrsStage(subjects, typesToShow) {
    function getSubjects(stage, index) {
        if (stage === 'Locked') {
            return subjects.filter(subject => subject['srs_stage'] != 0
                && !subject['srs_stage']
                && typesToShow.includes(subject.subjectType));
        }
        return subjects.filter(subject => subject['srs_stage'] == index && typesToShow.includes(subject.subjectType))
    }

    return getWanikaniSrsStages().map((stage, index) => ({
        title: stage,
        subjects: getSubjects(stage, index)
    }));
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

function FilterControls({groupBy, setGroupBy}) {
    return (
        <Card>
            <CardContent>
                Group By
                <ToggleButtonGroup
                    value={groupBy}
                    size={'small'}
                    exclusive
                    onChange={e => setGroupBy(e.target.value)}
                >
                    {[
                        groupByOptions.level,
                        groupByOptions.srsStage
                    ].map((option) => (
                        <ToggleButton key={option.key}
                                      value={option.key}
                        >
                            {option.displayText}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </CardContent>
        </Card>
    )
}

function WanikaniItems() {
    const {apiKey} = useWanikaniApiKey();
    const [subjects, setSubjects] = useState([]);
    const [groupBy, setGroupBy] = useState(groupByOptions.srsStage.key);
    const [groups, setGroups] = useState([]);
    const [typesToShow, setTypesToShow] = useState(['kanji']);

    useEffect(() => {
        fetchData().then(setSubjects)
    }, []);

    useEffect(() => {

        if (groupBy === groupByOptions.level.key) {
            setGroups(groupByOptions.level.group(subjects, typesToShow));
        } else if (groupBy === groupByOptions.srsStage.key) {
            setGroups(groupByOptions.srsStage.group(subjects, typesToShow));
        }
    }, [groupBy, subjects]);

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <div style={styles.container}>
                <FilterControls groupBy={groupBy}
                                setGroupBy={setGroupBy}
                />

                {groups.map(group => (
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