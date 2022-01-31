import {Checkbox, Paper, ToggleButton, ToggleButtonGroup} from "@mui/material";
import * as React from "react";
import {useMemo, useState} from "react";
import {groupByOptions, sortByOptions, colorByOptions} from "../service/WanikaniDataUtil.js";

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

export function useWanikaniItemControls() {
    const [control, setControl] = useState({
        primaryGroupBy: groupByOptions.level,
        secondaryGroupBy: groupByOptions.none,
        sortBy: sortByOptions.itemName,
        colorBy: colorByOptions.itemType,
        typesToShow: ['kanji']
    });

    return [
        control,
        {
            control: setControl,
            primaryGroupBy: (groupBy) => setControl(prev => ({...prev, primaryGroupBy: groupBy})),
            secondaryGroupBy: (groupBy) => setControl(prev => ({...prev, secondaryGroupBy: groupBy})),
            sortBy: (sortBy) => setControl(prev => ({...prev, sortBy: sortBy})),
            colorBy: (colorBy) => setControl(prev => ({...prev, colorBy: colorBy})),
            typesToShow: (typesToShow) => setControl(prev => ({...prev, typesToShow: typesToShow})),
        }
    ];
}

function WanikaniItemsControlPanel({control, set}) {

    const {
        primaryGroupBy,
        secondaryGroupBy,
        sortBy,
        colorBy,
        typesToShow
    } = control;

    function onPrimaryGroupByChange(value) {
        let controlChanges = {primaryGroupBy: value};
        if (value.key === groupByOptions.none.key || value.key === secondaryGroupBy.key) {
            controlChanges.secondaryGroupBy = groupByOptions.none;
        }
        set.control(prev => ({...prev, ...controlChanges}))
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
                                   setGroupBy={set.secondaryGroupBy}
                                   disableOptions={secondaryGroupDisabled}
                    />
                </div>

            </ControlContainer>

            <SegmentControl title={'Sort By'}
                            value={sortBy}
                            setValue={set.sortBy}
                            options={sortByOptionsList}
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
                             options={['Radical', 'Kanji', 'Vocabulary']}
            />

            <div style={{height: '6px'}}/>

        </Paper>
    )
}

export default WanikaniItemsControlPanel;