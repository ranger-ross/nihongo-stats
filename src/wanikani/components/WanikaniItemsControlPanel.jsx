import {Card, CardContent, Checkbox, Paper, ToggleButton, ToggleButtonGroup} from "@mui/material";
import * as React from "react";
import {useMemo, useState} from "react";
import {groupByOptions, sortByOptions, colorByOptions} from "../service/WanikaniDataUtil.js";
import {ArrowDropDown, ArrowDropUp} from "@mui/icons-material";

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
            <strong style={{padding: '4px'}}>{title}</strong>

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
    const [control, setControl] = useState({
        primaryGroupBy: groupByOptions.level,
        secondaryGroupBy: groupByOptions.none,
        sortBy: sortByOptions.itemName,
        colorBy: colorByOptions.itemType,
        typesToShow: ['kanji'],
        sortReverse: false,
    });

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

function WanikaniItemsControlPanel({control, set}) {
    const {
        primaryGroupBy,
        secondaryGroupBy,
        sortBy,
        colorBy,
        typesToShow,
        sortReverse
    } = control;

    const secondaryGroupDisabled = useMemo(() => {
        if (primaryGroupBy.key === groupByOptions.none.key)
            return [groupByOptions.none, groupByOptions.srsStage, groupByOptions.level];
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
                <ControlContainer>
                    <strong style={{padding: '4px'}}>Group By</strong>

                    <GroupByToggle title={'Primary'}
                                   options={groupByOptionsList}
                                   groupBy={primaryGroupBy}
                                   setGroupBy={set.primaryGroupBy}
                    />

                    <GroupByToggle title={'Secondary'}
                                   options={groupByOptionsList}
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