import {
    Card,
    CardContent,
    Checkbox,
    MenuItem,
    Paper,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import * as React from "react";
import {useMemo, useState} from "react";
import {colorByOptions, groupByOptions, sortByOptions} from "../service/WanikaniDataUtil.ts";
import {ArrowDropDown, ArrowDropUp} from "@mui/icons-material";

const styles = {
    groupingPaper: {
        margin: '5px',
        padding: '8px',
    },
    optionContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        flexWrap: 'wrap'
    },
    optionLabel: {
        paddingLeft: '6px',
        minWidth: '85px'
    }
};

const presetOptions = {
    levels: {
        key: 'levels',
        text: 'Wanikani Levels',
        controls: {
            primaryGroupBy: groupByOptions.level,
            secondaryGroupBy: groupByOptions.itemType,
            sortBy: sortByOptions.itemName,
            colorBy: colorByOptions.itemType,
            typesToShow: ['radical', 'kanji', 'vocabulary'],
            sortReverse: false,
            frequencyGroupingSize: 500,
        }
    },
    jlpt: {
        key: 'jlpt',
        text: 'JLPT Levels',
        controls: {
            primaryGroupBy: groupByOptions.jlpt,
            secondaryGroupBy: groupByOptions.none,
            sortBy: sortByOptions.level,
            colorBy: colorByOptions.srsStage,
            typesToShow: ['kanji'],
            sortReverse: false,
            frequencyGroupingSize: 500,
        }
    },
    frequency: {
        key: 'frequency',
        text: 'Frequency',
        controls: {
            primaryGroupBy: groupByOptions.frequency,
            secondaryGroupBy: groupByOptions.none,
            sortBy: sortByOptions.level,
            colorBy: colorByOptions.srsStage,
            typesToShow: ['kanji'],
            sortReverse: false,
            frequencyGroupingSize: 500,
        }
    },
};

function GroupByToggle({title, options, groupBy, setGroupBy, disableOptions}) {
    return (
        <div style={styles.optionContainer}>
            <div style={styles.optionLabel}>{title}</div>
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
        </div>
    );
}

function ControlContainer({children}) {
    return (
        <Paper elevation={2} style={styles.groupingPaper}>
            {children}
        </Paper>
    );
}

function SegmentControl({title, value, setValue, options, sortArrow}) {
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
                            {!!sortArrow && sortArrow(option) !== 'none' ? (
                                sortArrow(option) === 'up' ? <ArrowDropDown fontSize={"small"}/> :
                                    <ArrowDropUp fontSize={"small"}/>
                            ) : null}
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
            <strong>{title}</strong>

            <div style={styles.optionContainer}>
                {subtitle ? (
                    <div style={styles.optionLabel}>{subtitle}</div>
                ) : null}
                <div>
                    {options.map((option) => (
                        <span key={option.key}>
                        <Checkbox checked={value.includes(option.key)}
                                  size="small"
                                  disabled={option.disabled || (value.length == 1 && value.includes(option.key))}
                                  onClick={() => onChange(option.key)}
                        /> {option.text}</span>
                    ))}
                </div>
            </div>
        </ControlContainer>
    );
}

export function useWanikaniItemControls() {
    const [control, setControl] = useState(presetOptions.levels.controls);

    const onPrimaryGroupByChange = (value) => setControl(prev => {
        let changes = {primaryGroupBy: value};
        if (value.key === groupByOptions.none.key || value.key === prev.secondaryGroupBy.key) {
            changes.secondaryGroupBy = groupByOptions.none;
        }
        return ({...prev, ...changes});
    });

    const onSortByChange = (sortBy) => setControl(prev => {
        if (!sortBy)
            return prev;
        const isChange = prev.sortBy.key !== sortBy.key;
        let sortReverse = isChange ? false : !prev.sortReverse;
        return {...prev, sortBy: sortBy, sortReverse: sortReverse};
    });


    const onTypesToShowChange = (typesToShow) => setControl(prev => {
        if (!typesToShow || typesToShow.length == 0)
            return prev;

        let changes = {
            typesToShow: typesToShow
        };

        const isKanjiOnly = typesToShow.length === 1 && typesToShow[0] === 'kanji';

        if (!isKanjiOnly && prev.colorBy.key === colorByOptions.jlpt.key) {
            changes.colorBy = colorByOptions.itemType;
        } else if (isKanjiOnly && prev.colorBy.key === colorByOptions.itemType.key) {
            changes.colorBy = colorByOptions.srsStage;
        }

        if (!isKanjiOnly && prev.sortBy.key === sortByOptions.frequency.key) {
            changes.sortBy = sortByOptions.level;
            changes.sortReverse = false;
        }

        if (!isKanjiOnly && prev.primaryGroupBy.key === groupByOptions.frequency.key) {
            changes.primaryGroupBy = groupByOptions.level;
            changes.secondaryGroupBy = groupByOptions.none;
        }

        return {...prev, ...changes};
    });

    return [
        control,
        {
            control: setControl,
            primaryGroupBy: onPrimaryGroupByChange,
            secondaryGroupBy: (groupBy) => setControl(prev => ({...prev, secondaryGroupBy: groupBy})),
            sortBy: onSortByChange,
            colorBy: (colorBy) => setControl(prev => ({...prev, colorBy: colorBy})),
            typesToShow: onTypesToShowChange,
            frequencyGroupingSize: (size) => setControl(prev => ({...prev, frequencyGroupingSize: size})),
        }
    ];
}

function getGroupByOptions(typesToShow) {
    let isKanjiOnly = typesToShow.length === 1 && typesToShow[0] === 'kanji';

    let groupByOptionsList = [
        groupByOptions.none,
        groupByOptions.level,
        groupByOptions.srsStage,
    ];
    if (isKanjiOnly) {
        groupByOptionsList.push(groupByOptions.jlpt);
        groupByOptionsList.push(groupByOptions.frequency);
    } else {
        groupByOptionsList.push(groupByOptions.itemType);
    }
    return groupByOptionsList;
}

function getSortByOptions(typesToShow) {
    let isKanjiOnly = typesToShow.length === 1 && typesToShow[0] === 'kanji';

    let sortByOptionsList = [
        sortByOptions.itemName,
        sortByOptions.level,
        sortByOptions.srsStage,
    ];

    if (isKanjiOnly) {
        sortByOptionsList.push(sortByOptions.jlpt);
        sortByOptionsList.push(sortByOptions.frequency);
    } else {
        sortByOptionsList.push(sortByOptions.itemType);
    }
    return sortByOptionsList;
}

function getColorByOptions(typesToShow) {
    let isKanjiOnly = typesToShow.length === 1 && typesToShow[0] === 'kanji';

    let colorByOptionsList = [
        colorByOptions.srsStage,
    ];

    if (isKanjiOnly) {
        colorByOptionsList.push(colorByOptions.jlpt);
    } else {
        colorByOptionsList.push(colorByOptions.itemType);
    }
    return colorByOptionsList;
}

function PresetSelector({options, onChange}) {
    const placeholder = {
        key: 'placeholder',
        text: 'Presets'
    }

    return (
        <Select
            style={{minWidth: '150px'}}
            size={'small'}
            value={placeholder}
            onChange={e => onChange(e.target.value)}
        >
            <MenuItem value={placeholder}>
                {placeholder.text}
            </MenuItem>

            {options.map((option) => (
                <MenuItem key={option.key}
                          value={option.controls}
                >
                    {option.text}
                </MenuItem>
            ))}
        </Select>
    );
}

function FrequencyGroupSizeTextField({onChange, initialSize}) {
    const [text, setText] = useState(`${initialSize}`);
    const triggerChange = () => onChange && text.length > 0 ? onChange(parseInt(text)) : null;
    return (
        <div>
            <TextField
                size={'small'}
                label={'Group Size'}
                value={text}
                onChange={e => {
                    if (!!e.target.value && (isNaN(Number(e.target.value)) || e.target.value.includes('.')))
                        return;
                    setText(e.target.value);
                }}
                onKeyUp={e => {
                    if (e.code === 'Enter')
                        triggerChange();
                }}
            />
        </div>
    );
}

function WanikaniItemsControlPanel({control, set}) {
    const {
        primaryGroupBy,
        secondaryGroupBy,
        sortBy,
        colorBy,
        typesToShow,
        sortReverse,
        frequencyGroupingSize,
    } = control;

    const secondaryGroupDisabled = useMemo(() => {
        if (primaryGroupBy.key === groupByOptions.none.key)
            return [groupByOptions.srsStage, groupByOptions.level, groupByOptions.jlpt, groupByOptions.itemType];
        else
            return [primaryGroupBy];
    }, [primaryGroupBy.key]);

    const allowRadicalsAndVocab = primaryGroupBy.key !== groupByOptions.jlpt.key && secondaryGroupBy.key !== groupByOptions.jlpt.key;

    const groupByOptionsList = getGroupByOptions(typesToShow);
    const sortByOptionsList = getSortByOptions(typesToShow);
    const colorByOptionsList = getColorByOptions(typesToShow);
    const displayTypeOptionsList = [
        {text: 'Radicals', key: 'radical', disabled: !allowRadicalsAndVocab},
        {text: 'Kanji', key: 'kanji', disabled: false},
        {text: 'Vocabulary', key: 'vocabulary', disabled: !allowRadicalsAndVocab},
    ];

    return (
        <Card style={{margin: '5px'}}>
            <CardContent>
                <div style={{display: 'flex', justifyContent: 'space-between', marginRight: '25px'}}>
                    <Typography variant={'h6'}>Controls</Typography>
                    <PresetSelector
                        options={[
                            presetOptions.levels,
                            presetOptions.jlpt,
                            presetOptions.frequency,
                        ]}
                        onChange={preset => set.control(preset)}
                    />
                </div>

                <ControlContainer>
                    <strong>Group By</strong>

                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <GroupByToggle title={'Primary'}
                                       options={groupByOptionsList}
                                       groupBy={primaryGroupBy}
                                       setGroupBy={set.primaryGroupBy}
                        />
                        {primaryGroupBy.key === 'frequency' ? (
                            <FrequencyGroupSizeTextField
                                initialSize={frequencyGroupingSize}
                                onChange={set.frequencyGroupingSize}
                            />
                        ) : null}
                    </div>

                    <GroupByToggle title={'Secondary'}
                                   options={groupByOptionsList.filter(group => group.key != 'frequency')}
                                   groupBy={secondaryGroupBy}
                                   setGroupBy={set.secondaryGroupBy}
                                   disableOptions={secondaryGroupDisabled}
                    />

                </ControlContainer>

                <SegmentControl title={'Sort By'}
                                value={sortBy}
                                setValue={set.sortBy}
                                options={sortByOptionsList}
                                sortArrow={option => option.key === sortBy.key ? (sortReverse ? 'down' : 'up') : 'none'}
                />

                <SegmentControl title={'Color By'}
                                value={colorBy}
                                setValue={set.colorBy}
                                options={colorByOptionsList}
                />

                <CheckboxControl title={'Display'}
                                 subtitle={'Types'}
                                 value={typesToShow}
                                 setValue={set.typesToShow}
                                 options={displayTypeOptionsList}
                />

                <div style={{height: '6px'}}/>
            </CardContent>
        </Card>
    )
}

export default WanikaniItemsControlPanel;
