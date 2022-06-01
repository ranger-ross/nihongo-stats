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
import {
    colorByOptions,
    groupByOptions,
    sortByOptions,
    WKColorByOption,
    WKGroupByOption,
    WKSortByOption
} from "../service/WanikaniDataUtil";
import {ArrowDropDown, ArrowDropUp} from "@mui/icons-material";
import {AppStyles} from "../../util/TypeUtils";

const styles: AppStyles = {
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

type WKItemControls = {
    primaryGroupBy: WKGroupByOption,
    secondaryGroupBy: WKGroupByOption,
    sortBy: WKSortByOption,
    colorBy: WKColorByOption,
    typesToShow: string[],
    sortReverse: boolean,
    frequencyGroupingSize: number,
};

type WKItemPreset = {
    key: string,
    text: string,
    controls: WKItemControls
};

const presetOptions: { [key: string]: WKItemPreset } = {
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

type GroupByToggleProps = {
    title: string,
    options: WKGroupByOption[],
    groupBy: WKGroupByOption,
    setGroupBy: (s: WKGroupByOption) => void,
    disableOptions?: WKGroupByOption[]
};

function GroupByToggle({title, options, groupBy, setGroupBy, disableOptions}: GroupByToggleProps) {
    return (
        <div style={styles.optionContainer}>
            <div style={styles.optionLabel}>{title}</div>
            <ToggleButtonGroup
                value={groupBy.key}
                size={'small'}
                exclusive
                onChange={(e: React.MouseEvent<any>) => setGroupBy(options.find(o => o.key === e.currentTarget.value) as WKGroupByOption)}
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

function ControlContainer({children}: React.PropsWithChildren<any>) {
    return (
        <Paper elevation={2} style={styles.groupingPaper}>
            {children}
        </Paper>
    );
}

type SegmentOption = {
    key: string,
    displayText: string
};

type SegmentControlProps = {
    title: string,
    value: SegmentOption,
    setValue: (v: SegmentOption) => void,
    options: SegmentOption[],
    sortArrow?: (v: SegmentOption) => 'down' | 'up' | 'none'
};

function SegmentControl({title, value, setValue, options, sortArrow}: SegmentControlProps) {
    return (
        <ControlContainer>
            <div style={styles.optionContainer}>
                <strong style={styles.optionLabel}>{title}</strong>
                <ToggleButtonGroup
                    value={value.key}
                    size={'small'}
                    exclusive
                    onChange={(e: React.MouseEvent<any>) => setValue(options.find(o => o.key === e.currentTarget.value) as SegmentOption)}
                >
                    {options.map((option: SegmentOption) => (
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

type CheckboxControlOption = {
    key: string,
    text: string,
    disabled: boolean,
};

type CheckboxControlProps = {
    title: string,
    subtitle: string,
    value: string[],
    setValue: (v: string[]) => void,
    options: CheckboxControlOption[]
};

function CheckboxControl({title, subtitle, value, setValue, options}: CheckboxControlProps) {
    function onChange(option: string) {
        const removeIndex = value.indexOf(option.toLowerCase());
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

type WanikaniItemControls = {
    control: WKItemControls,
    set: {
        control: (c: WKItemControls) => void,
        primaryGroupBy: (g: WKGroupByOption) => void,
        secondaryGroupBy: (g: WKGroupByOption) => void,
        sortBy: (s: WKSortByOption) => void,
        colorBy: (c: WKColorByOption) => void,
        typesToShow: (t: string[]) => void,
        frequencyGroupingSize: (n: number) => void,
    }
};

type WanikaniItemControlChanges = {
    primaryGroupBy?: WKGroupByOption,
    secondaryGroupBy?: WKGroupByOption,
    sortBy?: WKSortByOption,
    colorBy?: WKColorByOption,
    typesToShow?: string[],
    sortReverse?: boolean,
    frequencyGroupingSize?: number,
};

export function useWanikaniItemControls(): WanikaniItemControls {
    const [control, setControl] = useState<WKItemControls>(presetOptions.levels.controls);

    const onPrimaryGroupByChange = (value: WKGroupByOption) => setControl(prev => {
        const changes: WanikaniItemControlChanges = {primaryGroupBy: value};
        if (value.key === groupByOptions.none.key || value.key === prev.secondaryGroupBy.key) {
            changes.secondaryGroupBy = groupByOptions.none;
        }
        return ({...prev, ...changes});
    });

    const onSortByChange = (sortBy: WKSortByOption) => setControl(prev => {
        if (!sortBy)
            return prev;
        const isChange = prev.sortBy.key !== sortBy.key;
        const sortReverse = isChange ? false : !prev.sortReverse;
        return {...prev, sortBy: sortBy, sortReverse: sortReverse};
    });


    const onTypesToShowChange = (typesToShow: string[]) => setControl(prev => {
        if (!typesToShow || typesToShow.length == 0)
            return prev;

        const changes: WanikaniItemControlChanges = {
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

    return {
        control: control,
        set: {
            control: setControl,
            primaryGroupBy: onPrimaryGroupByChange,
            secondaryGroupBy: (groupBy) => setControl(prev => ({...prev, secondaryGroupBy: groupBy})),
            sortBy: onSortByChange,
            colorBy: (colorBy) => setControl(prev => ({...prev, colorBy: colorBy})),
            typesToShow: onTypesToShowChange,
            frequencyGroupingSize: (size) => setControl(prev => ({...prev, frequencyGroupingSize: size})),
        }
    };
}

function getGroupByOptions(typesToShow: string[]) {
    const isKanjiOnly = typesToShow.length === 1 && typesToShow[0] === 'kanji';

    const groupByOptionsList = [
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

function getSortByOptions(typesToShow: string[]) {
    const isKanjiOnly = typesToShow.length === 1 && typesToShow[0] === 'kanji';

    const sortByOptionsList = [
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

function getColorByOptions(typesToShow: string[]) {
    const isKanjiOnly = typesToShow.length === 1 && typesToShow[0] === 'kanji';

    const colorByOptionsList = [
        colorByOptions.srsStage,
    ];

    if (isKanjiOnly) {
        colorByOptionsList.push(colorByOptions.jlpt);
    } else {
        colorByOptionsList.push(colorByOptions.itemType);
    }
    return colorByOptionsList;
}

type PresetSelectorProps = {
    options: WKItemPreset[],
    onChange: (v: WKItemPreset) => void
};

function PresetSelector({options, onChange}: PresetSelectorProps) {
    const placeholder = {
        key: 'placeholder',
        text: 'Presets'
    }

    return (
        <Select
            style={{minWidth: '150px'}}
            size={'small'}
            value={placeholder}
            onChange={e => onChange(e.target.value as WKItemPreset)}
        >
            {/*@ts-ignore*/}
            <MenuItem value={placeholder}>
                {placeholder.text}
            </MenuItem>

            {options.map((option) => (
                /*@ts-ignore*/
                <MenuItem key={option.key}
                          value={option.controls}
                >
                    {option.text}
                </MenuItem>
            ))}
        </Select>
    );
}

type FrequencyGroupSizeTextFieldProps = {
    onChange?: (v: number) => void,
    initialSize: number
};

function FrequencyGroupSizeTextField({onChange, initialSize}: FrequencyGroupSizeTextFieldProps) {
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

type WanikaniItemsControlPanelProps = WanikaniItemControls;

function WanikaniItemsControlPanel({control, set}: WanikaniItemsControlPanelProps) {
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
                        // @ts-ignore
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
                                setValue={set.sortBy as unknown as (v: SegmentOption) => void}
                                options={sortByOptionsList}
                                sortArrow={option => option.key === sortBy.key ? (sortReverse ? 'down' : 'up') : 'none'}
                />

                <SegmentControl title={'Color By'}
                                value={colorBy}
                                setValue={set.colorBy as unknown as (v: SegmentOption) => void}
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
