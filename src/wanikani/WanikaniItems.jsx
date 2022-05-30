import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect.tsx";
import {Card, CardContent, Typography} from "@mui/material";
import WanikaniItemTile from "./components/WanikaniItemTile.jsx";
import WanikaniApiService from "./service/WanikaniApiService.ts";
import {combineAssignmentAndSubject, createAssignmentMap, isSubjectHidden} from "./service/WanikaniDataUtil.ts";
import WanikaniItemsControlPanel, {useWanikaniItemControls} from "./components/WanikaniItemsControlPanel.jsx";
import VisibilitySensor from "react-visibility-sensor";

const styles = {
    container: {
        margin: '5px'
    },
    groupTitle: {
        paddingBottom: '4px'
    },
    subGroupTitle: {
        paddingTop: '12px',
    },
};

function SubjectTile({subject, colorBy}) {
    return useMemo(() => (
        <WanikaniItemTile
            text={subject.characters || '?'}
            link={subject['document_url']}
            meaning={subject?.meanings?.map(m => m.meaning).join(', ')}
            srsLevel={subject['srs_stage']}
            color={colorBy.color(subject)}
            size={5}
            type={subject.subjectType}
            level={subject.level}
            readings={subject.readings}
            nextReviewDate={!!subject['available_at'] ? new Date(subject['available_at']) : null}
        />
    ), [subject, colorBy.key]);
}

function ItemGroupingData({subjects, secondaryGroupBy, sortBy, colorBy, sortReverse}) {
    const subGroups = useMemo(() => secondaryGroupBy.group(subjects), [subjects, secondaryGroupBy.key]);

    const sortedSubGroups = useMemo(() => subGroups.map(sg => ({
        ...sg,
        subjects: sortReverse ? sortBy.sort(sg.subjects).reverse() : sortBy.sort(sg.subjects)
    })), [subGroups, sortBy.key, sortReverse]);

    return (
        <>
            {sortedSubGroups.map(group => (
                <div key={group.title}>
                    <div style={styles.subGroupTitle}>
                        {group.title === 'All Items' ? null : group.title}
                    </div>
                    <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                        {group.subjects?.map(subject => (
                            <SubjectTile key={subject.subjectId + '-subject'}
                                         subject={subject}
                                         colorBy={colorBy}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </>
    )
}

function UnloadedGrouping() {
    return (
        <div style={{height: '100px'}}>Loading...</div>
    );
}

function ItemGrouping({title, subjects, secondaryGroupBy, sortBy, colorBy, sortReverse}) {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <Card style={{margin: '5px'}}>
            <CardContent>

                <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                    <Typography variant={'h6'}
                                color={'textPrimary'}
                                style={styles.groupTitle}
                    >
                        {title}
                    </Typography>
                </div>
                <VisibilitySensor partialVisibility={true}
                                  offset={{bottom: -300}}
                                  onChange={(isVisible) => isVisible ? setIsLoaded(true) : null}>
                    {isLoaded ? (
                        <ItemGroupingData subjects={subjects}
                                          secondaryGroupBy={secondaryGroupBy}
                                          sortBy={sortBy}
                                          colorBy={colorBy}
                                          sortReverse={sortReverse}
                        />
                    ) : <UnloadedGrouping/>}

                </VisibilitySensor>
            </CardContent>
        </Card>
    );
}

async function fetchItems() {
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


function WanikaniItems() {
    const {apiKey} = useWanikaniApiKey();
    const [subjects, setSubjects] = useState([]);
    const [control, set] = useWanikaniItemControls();

    useEffect(() => {
        fetchItems().then(setSubjects)
    }, []);


    const subjectsToShow = useMemo(() => filterSubjectsByType(subjects, control.typesToShow), [subjects, control.typesToShow]);

    const groups = useMemo(() => control.primaryGroupBy.group(subjectsToShow, {
        frequencyGroupingSize: control.frequencyGroupingSize,
    }), [control.primaryGroupBy, subjectsToShow, control.frequencyGroupingSize]);

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <div style={styles.container}>
                <WanikaniItemsControlPanel control={control}
                                           set={set}
                />

                {groups.map(group => (
                    <ItemGrouping key={group.title}
                                  title={group.title}
                                  subjects={group.subjects}
                                  secondaryGroupBy={control.secondaryGroupBy}
                                  sortBy={control.sortBy}
                                  colorBy={control.colorBy}
                                  sortReverse={control.sortReverse}
                    />
                ))}
            </div>
        </RequireOrRedirect>
    );
}

export default WanikaniItems;
