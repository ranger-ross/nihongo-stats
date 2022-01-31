import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";
import {Card, CardContent, Checkbox, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import {WanikaniItemTileV2} from "./components/WanikaniItemTile.jsx";
import WanikaniApiService from "./service/WanikaniApiService.js";
import {combineAssignmentAndSubject, createAssignmentMap, isSubjectHidden} from "./service/WanikaniDataUtil.js";
import {getColorByWanikaniSrsStage} from "./service/WanikaniStyleUtil.js";
import {WanikaniColors} from "../Constants.js";

const styles = {
    container: {
        margin: '5px'
    }
};

const groupByOptions = {
    none: {
        key: 'none',
        displayText: 'None',
        group: (subjects) => [
            {
                title: 'All Items',
                subjects: subjects,
            }
        ],
    },
    level: {
        key: 'level',
        displayText: 'Level',
        group: (subjects) => {
            let levelsData = {};

            for (let subject of subjects) {
                if (!levelsData[subject.level]) {
                    levelsData[subject.level] = [];
                }
                levelsData[subject.level].push(subject);
            }

            function getWanikaniLevels() {
                return Array.from({length: 60}, (_, i) => i + 1);
            }

            return getWanikaniLevels()
                .map(level => ({
                    title: 'Level ' + level,
                    subjects: levelsData[level] ?? []
                }))
                .filter(group => group.subjects.length > 0);
        },
    },
    srsStage: {
        key: 'srsStage',
        displayText: 'SRS Stage',
        group: (subjects) => {
            let stageMap = {};

            for (let subject of subjects) {
                let srsStage = subject['srs_stage'] != 0 && !subject['srs_stage'] ? 'locked' : subject['srs_stage'];
                if (!stageMap[srsStage]) {
                    stageMap[srsStage] = [];
                }
                stageMap[srsStage].push(subject);
            }

            return ['Unlocked', 'Apprentice 1', 'Apprentice 2', 'Apprentice 3', 'Apprentice 4',
                'Guru 1', 'Guru 2', 'Master', 'Enlightened', 'Burned', 'Locked']
                .map((stage, index) => ({
                    title: stage,
                    subjects: stageMap[stage === 'Locked' ? 'locked' : index] ?? []
                }))
                .filter(group => group.subjects.length > 0);
        },
    },
};

const sortByOptions = {
    none: {
        key: 'none',
        displayText: 'None',
        sort: (subjects) => subjects
    },
    itemName: {
        key: 'itemName',
        displayText: 'Item Name',
        sort: (subjects) => subjects.sort((a, b) => a.slug.toLowerCase().localeCompare(b.slug.toLowerCase()))
    },
    level: {
        key: 'level',
        displayText: 'Level',
        sort: (subjects) => subjects.sort((a, b) => a.level - b.level)
    },
    srsStage: {
        key: 'srsStage',
        displayText: 'SRS Stage',
        sort: (subjects) => subjects.sort((a, b) => a['srs_stage'] - b['srs_stage'])
    },
    itemType: {
        key: 'itemType',
        displayText: 'Item Type',
        sort: (subjects) => {
            const typeOrder = {
                radical: 1,
                kanji: 2,
                vocabulary: 3
            };
            return subjects.sort((a, b) => typeOrder[a.subjectType] - typeOrder[b.subjectType]);
        }
    },
};

const colorByOptions = {
    srsStage: {
        key: 'srsStage',
        displayText: 'SRS Stage',
        color: (subject) => getColorByWanikaniSrsStage(subject['srs_stage'])
    },
    itemType: {
        key: 'itemType',
        displayText: 'Item Type',
        color: (subject) => {
            if (subject.subjectType === 'radical')
                return WanikaniColors.blue;
            else if (subject.subjectType === 'kanji')
                return WanikaniColors.pink;
            else
                return WanikaniColors.purple;
        }
    },
};

function SubjectTile({subject, colorBy}) {
    return useMemo(() => (
        <WanikaniItemTileV2
            text={subject.characters || '?'}
            link={subject['document_url']}
            meaning={subject?.meanings?.map(m => m.meaning).join(', ')}
            srsLevel={subject['srs_stage']}
            color={colorBy.color(subject)}
            size={5}
        />
    ), [subject, colorBy.key]);
}

function ItemGrouping({title, subjects, secondaryGroupBy, sortBy, colorBy}) {
    const subGroups = useMemo(() => secondaryGroupBy.group(subjects), [subjects, secondaryGroupBy.key]);

    const sortedSubGroups = useMemo(() => subGroups.map(sg => ({
        ...sg,
        subjects: sortBy.sort(sg.subjects)
    })), [subGroups, sortBy.key])

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

                {sortedSubGroups.map(group => (
                    <div key={group.title}>
                        {group.title === 'All Items' ? null : group.title}
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {group.subjects?.map(subject => (
                                <SubjectTile key={subject.subjectId + '-subject'}
                                             subject={subject}
                                             colorBy={colorBy}
                                />
                            ))}
                        </div>
                    </div>
                ))}
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

function filterSubjectsByType(subjects, typesToShow) {
    let lookupMap = {};

    for (let type of typesToShow) {
        lookupMap[type.toLowerCase()] = true;
    }
    return subjects.filter(subject => lookupMap[subject.subjectType.toLowerCase()]);
}

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
                            sortBy,
                            setSortBy,
                            colorBy,
                            setColorBy,
                            typesToShow,
                            setTypesToShow
                        }) {
    const groupByOptionsList = [
        groupByOptions.none,
        groupByOptions.level,
        groupByOptions.srsStage
    ];

    const sortByOptionsList = [
        sortByOptions.itemName,
        sortByOptions.level,
        sortByOptions.srsStage,
        sortByOptions.itemType
    ];

    const colorByOptionsList = [
        colorByOptions.itemType,
        colorByOptions.srsStage,
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
                <br/>

                Sort By
                <ToggleButtonGroup
                    value={sortBy.key}
                    size={'small'}
                    exclusive
                    onChange={e => setSortBy(sortByOptionsList.find(o => o.key === e.target.value))}
                >
                    {sortByOptionsList.map((option) => (
                        <ToggleButton key={option.key}
                                      value={option.key}
                        >
                            {option.displayText}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <br/>

                Color By
                <ToggleButtonGroup
                    value={colorBy.key}
                    size={'small'}
                    exclusive
                    onChange={e => setColorBy(colorByOptionsList.find(o => o.key === e.target.value))}
                >
                    {colorByOptionsList.map((option) => (
                        <ToggleButton key={option.key}
                                      value={option.key}
                        >
                            {option.displayText}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <br/>

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
    const [sortBy, setSortBy] = useState(sortByOptions.none);
    const [colorBy, setColorBy] = useState(colorByOptions.itemType);

    useEffect(() => {
        fetchData().then(setSubjects)
    }, []);


    const subjectsToShow = useMemo(() => filterSubjectsByType(subjects, typesToShow), [subjects, typesToShow]);

    const groups = useMemo(() => primaryGroupBy.group(subjectsToShow), [primaryGroupBy, subjectsToShow]);

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
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                colorBy={colorBy}
                                setColorBy={setColorBy}
                />

                {groups.map(group => (
                    <ItemGrouping key={group.title}
                                  title={group.title}
                                  subjects={group.subjects}
                                  secondaryGroupBy={secondaryGroupBy}
                                  sortBy={sortBy}
                                  colorBy={colorBy}
                    />
                ))}
            </div>
        </RequireOrRedirect>
    );
}

export default WanikaniItems;