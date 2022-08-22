import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import {RoutePaths} from "../Routes";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import {Card, CardContent, Typography} from "@mui/material";
import WanikaniItemTile from "./components/WanikaniItemTile";
import WanikaniApiService from "./service/WanikaniApiService";
import {
    combineAssignmentAndSubject,
    createAssignmentMap,
    isSubjectHidden,
    JoinedRawWKAssignmentAndSubject,
    WKColorByOption,
    WKGroupByOption,
    WKSortByOption
} from "./service/WanikaniDataUtil";
import WanikaniItemsControlPanel, {useWanikaniItemControls} from "./components/WanikaniItemsControlPanel";
import VisibilitySensor from "react-visibility-sensor";
import {AppStyles} from "../util/TypeUtils";

const styles: AppStyles = {
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

type SubjectTileProps = {
    subject: JoinedRawWKAssignmentAndSubject,
    colorBy: WKColorByOption
};

function SubjectTile({subject, colorBy}: SubjectTileProps) {
    return useMemo(() => (
        <WanikaniItemTile
            text={subject.characters || '?'}
            link={subject.documentUrl}
            meaning={subject?.meanings?.map(m => m.meaning).join(', ')}
            srsLevel={subject.srsStage}
            color={colorBy.color(subject) as string}
            size={5}
            type={subject.subjectType}
            level={subject.level}
            readings={subject.readings}
            nextReviewDate={subject.availableAt}
        />
    ), [subject, colorBy.key]);
}

type ItemGroupingDataProps = {
    subjects: JoinedRawWKAssignmentAndSubject[],
    secondaryGroupBy: WKGroupByOption,
    sortBy: WKSortByOption,
    colorBy: WKColorByOption,
    sortReverse: boolean
};

function ItemGroupingData({subjects, secondaryGroupBy, sortBy, colorBy, sortReverse}: ItemGroupingDataProps) {
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


type ItemGroupingProps = {
    title: string,
    subjects: JoinedRawWKAssignmentAndSubject[],
    secondaryGroupBy: WKGroupByOption,
    sortBy: WKSortByOption,
    colorBy: WKColorByOption,
    sortReverse: boolean
};

function ItemGrouping({title, subjects, secondaryGroupBy, sortBy, colorBy, sortReverse}: ItemGroupingProps) {
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
                                  onChange={(isVisible: boolean) => isVisible ? setIsLoaded(true) : null}>
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
    const assignments = await WanikaniApiService.getAllAssignments();
    const assignmentMap = createAssignmentMap(assignments);

    return subjects
        .filter(subject => !isSubjectHidden(subject))
        .map(s => combineAssignmentAndSubject(assignmentMap[s.id], s));
}

function filterSubjectsByType(subjects: JoinedRawWKAssignmentAndSubject[], typesToShow: string[]) {
    const lookupMap: { [key: string]: boolean } = {};

    for (const type of typesToShow) {
        lookupMap[type.toLowerCase()] = true;
    }
    return subjects.filter(subject => lookupMap[subject.subjectType.toLowerCase()]);
}

function useSubjects() {
    const [subjects, setSubjects] = useState<JoinedRawWKAssignmentAndSubject[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        fetchItems()
            .then(data => {
                if (!isSubscribed)
                    return;
                setSubjects(data);
            });
        return () => {
            isSubscribed = false;
        }
    }, []);

    return subjects;
}

function WanikaniItems() {
    const {apiKey} = useWanikaniApiKey();
    const subjects = useSubjects();
    const {control, set} = useWanikaniItemControls();

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
