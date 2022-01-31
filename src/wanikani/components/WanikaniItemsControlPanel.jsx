import {Checkbox, Paper, ToggleButton, ToggleButtonGroup} from "@mui/material";
import * as React from "react";
import {getColorByWanikaniSrsStage, getColorByWanikaniSubjectType} from "../service/WanikaniStyleUtil.js";
import {useMemo} from "react";
import kanji from "kanji";
import {kanjiFrequencyLookupMap} from "../../util/KanjiDataUtil.js";

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
    jtpt: {
        key: 'jlpt',
        displayText: 'JLPT',
        group: (subjects) => {

            function toMap(array) {
                let map = {};
                for (const value of array) {
                    map[value] = true;
                }
                return map;
            }

            const jtlp = [
                toMap(kanji.jlpt.n5),
                toMap(kanji.jlpt.n4),
                toMap(kanji.jlpt.n3),
                toMap(kanji.jlpt.n2),
                toMap(kanji.jlpt.n1),
            ];

            let map = {};

            for (let subject of subjects) {
                let idx = jtlp.findIndex(lvl => lvl[subject['slug']]);
                if (!map[idx]) {
                    map[idx] = [];
                }
                map[idx].push(subject);
            }

            return ['N5', 'N4', 'N3', 'N2', 'N1', 'Non-JLPT']
                .map((level, index) => ({
                    title: level,
                    subjects: map[level === 'Non-JLPT' ? -1 : index] ?? []
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
    frequency: {
        key: 'frequency',
        displayText: 'Frequency',
        sort: (subjects) => {

            function getFrequency(subject) {
                return kanjiFrequencyLookupMap[subject.slug];
            }

            return subjects.sort((a, b) => getFrequency(a) - getFrequency(b));
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

function GroupByToggle({options, groupBy, setGroupBy, disableOptions}) {
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
                              disabled={disableOptions?.map(o => o?.key).includes(option.key)}
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
    groupByOptions.srsStage,
    groupByOptions.jtpt,
];

const sortByOptionsList = [
    sortByOptions.itemName,
    sortByOptions.level,
    sortByOptions.srsStage,
    sortByOptions.itemType,
    sortByOptions.frequency,
];

const colorByOptionsList = [
    colorByOptions.itemType,
    colorByOptions.srsStage,
];

function ControlContainer({children}) {
    return (
        <Paper elevation={2} style={styles.groupingPaper}>
            {children}
        </Paper>
    );
}

function SegmentControl({title, value, setValue, options}) {
    return (
        <ControlContainer>
            <div style={styles.optionContainer}>
                <strong style={styles.optionLabel}>{title}</strong>
                <ToggleButtonGroup
                    value={value.key}
                    size={'small'}
                    exclusive
                    onChange={e => setValue(options.find(o => o.key === e.target.value))}
                >
                    {options.map((option) => (
                        <ToggleButton key={option.key}
                                      value={option.key}
                        >
                            {option.displayText}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </div>
        </ControlContainer>
    );
}

function CheckboxControl({title, subtitle, value, setValue, options}) {
    function onChange(option) {
        let removeIndex = value.indexOf(option.toLowerCase());
        if (removeIndex === -1) {
            setValue([...value, option.toLowerCase()]);
        } else {
            value.splice(removeIndex, 1)
            setValue([...value]);
        }
    }

    return (
        <ControlContainer>
            <strong style={{padding: '4px'}}>{title}</strong>

            <div style={styles.optionContainer}>
                {subtitle ? (
                    <div style={styles.optionLabel}>{subtitle}</div>
                ) : null}
                <div>
                    {options.map((option) => (
                        <span key={option}>
                        <Checkbox checked={value.includes(option.toLowerCase())}
                                  size="small"
                                  disabled={value.length == 1 && value.includes(option.toLowerCase())}
                                  onClick={() => onChange(option)}
                        /> {option}</span>
                    ))}
                </div>
            </div>
        </ControlContainer>
    );
}

function WanikaniItemsControlPanel(props) {

    const {
        primaryGroupBy, setPrimaryGroupBy,
        secondaryGroupBy, setSecondaryGroupBy,
        sortBy, setSortBy,
        colorBy, setColorBy,
        typesToShow, setTypesToShow
    } = props

    function onPrimaryGroupByChange(value) {
        if (value.key === groupByOptions.none.key || value.key === secondaryGroupBy.key) {
            setSecondaryGroupBy(groupByOptions.none)
        }
        setPrimaryGroupBy(value);
    }

    const secondaryGroupDisabled = useMemo(() => {
        if (primaryGroupBy.key === groupByOptions.none.key)
            return [groupByOptions.none, groupByOptions.srsStage, groupByOptions.level];
        else
            return [primaryGroupBy];
    }, [primaryGroupBy.key]);

    return (
        <Paper>
            <ControlContainer>
                <strong style={{padding: '4px'}}>Group By</strong>

                <div style={styles.optionContainer}>
                    <div style={styles.optionLabel}>Primary</div>
                    <GroupByToggle options={groupByOptionsList}
                                   groupBy={primaryGroupBy}
                                   setGroupBy={onPrimaryGroupByChange}
                    />
                </div>


                <div style={styles.optionContainer}>
                    <div style={styles.optionLabel}>Secondary</div>
                    <GroupByToggle options={groupByOptionsList}
                                   groupBy={secondaryGroupBy}
                                   setGroupBy={setSecondaryGroupBy}
                                   disableOptions={secondaryGroupDisabled}
                    />
                </div>

            </ControlContainer>

            <SegmentControl title={'Sort By'}
                            value={sortBy}
                            setValue={setSortBy}
                            options={sortByOptionsList}
            />

            <SegmentControl title={'Color By'}
                            value={colorBy}
                            setValue={setColorBy}
                            options={colorByOptionsList}
            />

            <CheckboxControl title={'Display'}
                             subtitle={'Types'}
                             value={typesToShow}
                             setValue={setTypesToShow}
                             options={['Radical', 'Kanji', 'Vocabulary']}
            />

            <div style={{height: '6px'}}/>

        </Paper>
    )
}

export default WanikaniItemsControlPanel;