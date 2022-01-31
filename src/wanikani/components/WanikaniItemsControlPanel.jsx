import {Checkbox, Paper, ToggleButton, ToggleButtonGroup} from "@mui/material";
import * as React from "react";
import {getColorByWanikaniSrsStage, getColorByWanikaniSubjectType} from "../service/WanikaniStyleUtil.js";

export const groupByOptions = {
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

export const sortByOptions = {
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

export const colorByOptions = {
    srsStage: {
        key: 'srsStage',
        displayText: 'SRS Stage',
        color: (subject) => getColorByWanikaniSrsStage(subject['srs_stage'])
    },
    itemType: {
        key: 'itemType',
        displayText: 'Item Type',
        color: (subject) => getColorByWanikaniSubjectType(subject.subjectType)
    },
};

const styles = {
    groupingPaper: {
        margin: '10px'
    },
    optionContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        flexWrap: 'wrap'
    },
    optionLabel: {
        paddingLeft: '8px',
        minWidth: '85px'
    }
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

function WanikaniItemsControlPanel({ // TODO: add disabling for options when appropriate
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
        <Paper>
            <Paper elevation={2} style={styles.groupingPaper}>
                <strong style={{padding: '4px'}}>Group By</strong>

                <div style={styles.optionContainer}>
                    <div style={styles.optionLabel}>Primary</div>
                    <GroupByToggle options={groupByOptionsList}
                                   groupBy={primaryGroupBy}
                                   setGroupBy={setPrimaryGroupBy}
                    />
                </div>


                <div style={styles.optionContainer}>
                    <div style={styles.optionLabel}>Secondary</div>
                    <GroupByToggle options={groupByOptionsList}
                                   groupBy={secondaryGroupBy}
                                   setGroupBy={setSecondaryGroupBy}
                    />
                </div>

            </Paper>

            <Paper elevation={2} style={styles.groupingPaper}>
                <div style={styles.optionContainer}>
                    <strong style={styles.optionLabel}>Sort By</strong>
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
                </div>
            </Paper>

            <Paper elevation={2} style={styles.groupingPaper}>
                <div style={styles.optionContainer}>
                    <strong style={styles.optionLabel}>Color By</strong>
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
                </div>
            </Paper>


            <Paper elevation={2} style={styles.groupingPaper}>
                <strong style={{padding: '4px'}}>Display</strong>

                <div style={styles.optionContainer}>
                    <div style={styles.optionLabel}>Types</div>
                    <div>
                        {['Radical', 'Kanji', 'Vocabulary'].map((option) => (
                            <span key={option}>
                        <Checkbox checked={typesToShow.includes(option.toLowerCase())}
                                  size="small"
                                  onClick={() => onTypeChange(option)}
                        /> {option}</span>
                        ))}
                    </div>
                </div>
            </Paper>

            <div style={{height: '6px'}}/>

        </Paper>
    )
}

export default WanikaniItemsControlPanel;