import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";
import {Card, CardContent, Typography} from "@mui/material";
import {WanikaniItemTileV2} from "./components/WanikaniItemTile.jsx";
import WanikaniApiService from "./service/WanikaniApiService.js";
import {combineAssignmentAndSubject, createAssignmentMap, isSubjectHidden} from "./service/WanikaniDataUtil.js";
import WanikaniItemsControlPanel, {
    colorByOptions,
    groupByOptions,
    sortByOptions
} from "./components/WanikaniItemsControlPanel.jsx";
import VisibilitySensor from "react-visibility-sensor";

const styles = {
    container: {
        margin: '5px'
    }
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

    const [isLoaded, setIsLoaded] = useState(false);

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
                <VisibilitySensor partialVisibility={true}
                                  offset={{bottom: -400}}
                                  onChange={(isVisible) => isVisible ? setIsLoaded(true) : null}>
                    {isLoaded ? (
                        <>
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
                        </>
                    ) : <div style={{height: '75px'}}>Loading...</div>}

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
    const [primaryGroupBy, setPrimaryGroupBy] = useState(groupByOptions.srsStage);
    const [secondaryGroupBy, setSecondaryGroupBy] = useState(groupByOptions.none);
    const [typesToShow, setTypesToShow] = useState(['kanji']);
    const [sortBy, setSortBy] = useState(sortByOptions.itemName);
    const [colorBy, setColorBy] = useState(colorByOptions.itemType);

    useEffect(() => {
        fetchItems().then(setSubjects)
    }, []);


    const subjectsToShow = useMemo(() => filterSubjectsByType(subjects, typesToShow), [subjects, typesToShow]);

    const groups = useMemo(() => primaryGroupBy.group(subjectsToShow), [primaryGroupBy, subjectsToShow]);

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <div style={styles.container}>
                <WanikaniItemsControlPanel primaryGroupBy={primaryGroupBy}
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