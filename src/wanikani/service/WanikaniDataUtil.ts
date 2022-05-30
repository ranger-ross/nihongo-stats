// @ts-ignore
import kanji from "kanji";
import {kanjiFrequencyLookupMap, kanjiJLPTLookupMap} from "../../util/KanjiDataUtil";
import {getColorByJLPTLevel, getColorByWanikaniSrsStage, getColorByWanikaniSubjectType} from "./WanikaniStyleUtil";
import {WanikaniColors} from "../../Constants";
import {RawWanikaniSubject, RawWanikaniSubjectData} from "../models/raw/RawWanikaniSubject";
import {RawWanikaniAssignment, RawWanikaniAssignmentData} from "../models/raw/RawWanikaniAssignment";

export function createSubjectMap(subjects: RawWanikaniSubject[]) {
    const map: { [id: number]: RawWanikaniSubject } = {};
    for (const subject of subjects) {
        map[subject.id] = subject;
    }
    return map;
}

export function createAssignmentMap(assignments: RawWanikaniAssignment[]) {
    const map: { [id: number]: RawWanikaniAssignment } = {};

    for (const assignment of assignments) {
        map[assignment.data['subject_id']] = assignment;
    }

    return map;
}

export type JoinedRawWKAssignmentAndSubject = RawWanikaniAssignmentData & RawWanikaniSubjectData & {
    hasAssignment: boolean,
    subjectId: number,
    subjectType: 'radical' | 'kanji' | 'vocabulary',
};

export function combineAssignmentAndSubject(assignment: RawWanikaniAssignment, subject: RawWanikaniSubject): JoinedRawWKAssignmentAndSubject {
    return {
        ...subject.data,
        ...assignment?.data,
        hasAssignment: !!assignment,
        subjectId: subject.id,

        // prefer this over 'subject_type'
        // if a subject has not been assigned it will not have a subject_type
        subjectType: subject.object as 'radical' | 'kanji' | 'vocabulary',
    };
}

export function isSubjectHidden(subject: RawWanikaniSubject) {
    return !!subject && !!subject.data && subject.data['hidden_at'];
}

export function getWanikaniSrsStageDescription(stage: number) {
    if (!stage && stage !== 0) {
        return 'Locked';
    }

    if (stage === 0) {
        return 'Lesson';
    }

    if (stage === 1) {
        return 'Apprentice 1';
    }

    if (stage === 2) {
        return 'Apprentice 2';
    }

    if (stage === 3) {
        return 'Apprentice 3';
    }

    if (stage === 4) {
        return 'Apprentice 4';
    }

    if (stage === 5) {
        return 'Guru 1';
    }

    if (stage === 6) {
        return 'Guru 2';
    }

    if (stage === 7) {
        return 'Master';
    }

    if (stage === 8) {
        return 'Enlightened';
    }

    if (stage === 9) {
        return 'Burned';
    }
    return null;
}

export const groupByOptions = {
    none: {
        key: 'none',
        displayText: 'None',
        group: (subjects: RawWanikaniSubject[]) => [
            {
                title: 'All Items',
                subjects: subjects,
            }
        ],
    },
    level: {
        key: 'level',
        displayText: 'Level',
        group: (subjects: JoinedRawWKAssignmentAndSubject[]) => {
            const levelsData: { [level: number]: JoinedRawWKAssignmentAndSubject[] } = {};

            for (const subject of subjects) {
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
        group: (subjects: JoinedRawWKAssignmentAndSubject[]) => {
            const stageMap: { [stage: number | string]: JoinedRawWKAssignmentAndSubject[] } = {};

            for (const subject of subjects) {
                const srsStage: string | number = subject['srs_stage'] != 0 && !subject['srs_stage'] ? 'locked' : subject['srs_stage'];
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
    jlpt: {
        key: 'jlpt',
        displayText: 'JLPT',
        group: (subjects: JoinedRawWKAssignmentAndSubject[]) => {

            function toMap(array: string[]) {
                const map: { [key: string]: boolean } = {};
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

            const map: { [idx: number]: any[] } = {};

            for (const subject of subjects) {
                const idx = jtlp.findIndex(lvl => lvl[subject['slug']]);
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
    itemType: {
        key: 'itemType',
        displayText: 'Item Type',
        group: (subjects: JoinedRawWKAssignmentAndSubject[]) => {
            return [
                {text: 'Radicals', type: 'radical'},
                {text: 'Kanji', type: 'kanji'},
                {text: 'Vocabulary', type: 'vocabulary'},
            ]
                .map((type) => ({
                    title: type.text,
                    subjects: subjects.filter(subject => subject.subjectType === type.type)
                }))
                .filter(group => group.subjects.length > 0);
        },
    },
    frequency: {
        key: 'frequency',
        displayText: 'Frequency',
        group: (subjects: JoinedRawWKAssignmentAndSubject[], params: { frequencyGroupingSize: number }) => {
            const size = params.frequencyGroupingSize;
            const temp = [...sortByOptions.frequency.sort(subjects)];

            const groups = [];
            let nextGroup = temp.splice(0, size);
            let i = 1;
            while (nextGroup.length > 0) {
                const start = size * i - size;
                groups.push({
                    title: `${start + 1}-${size * i}`,
                    subjects: nextGroup
                });
                nextGroup = temp.splice(0, size);
                i += 1;
            }
            return groups;
        },
    },
};

export const sortByOptions = {
    none: {
        key: 'none',
        displayText: 'None',
        sort: (subjects: RawWanikaniSubject[]) => subjects
    },
    itemName: {
        key: 'itemName',
        displayText: 'Item Name',
        sort: (subjects: JoinedRawWKAssignmentAndSubject[]) => subjects.sort((a, b) => a.slug.toLowerCase().localeCompare(b.slug.toLowerCase()))
    },
    level: {
        key: 'level',
        displayText: 'Level',
        sort: (subjects: JoinedRawWKAssignmentAndSubject[]) => subjects.sort((a, b) => a.level - b.level)
    },
    srsStage: {
        key: 'srsStage',
        displayText: 'SRS Stage',
        sort: (subjects: JoinedRawWKAssignmentAndSubject[]) => subjects.sort((a, b) => (b['srs_stage'] ?? -1) - (a['srs_stage'] ?? -1))
    },
    itemType: {
        key: 'itemType',
        displayText: 'Item Type',
        sort: (subjects: JoinedRawWKAssignmentAndSubject[]) => {
            const typeOrder = {
                radical: 1,
                kanji: 2,
                vocabulary: 3
            };
            // @ts-ignore
            return subjects.sort((a, b) => typeOrder[a.subjectType] - typeOrder[b.subjectType]);
        }
    },
    jlpt: {
        key: 'jlpt',
        displayText: 'JLPT',
        sort: (subjects: JoinedRawWKAssignmentAndSubject[]) => {
            function getJLPTLevel(subject: RawWanikaniSubjectData) {
                const level = kanjiJLPTLookupMap[subject.slug];
                if (level === 'N5') {
                    return 1;
                } else if (level === 'N4') {
                    return 2;
                } else if (level === 'N3') {
                    return 3;
                } else if (level === 'N2') {
                    return 4;
                } else if (level === 'N1') {
                    return 5;
                }
                return 100;
            }

            return subjects.sort((a, b) => getJLPTLevel(a) - getJLPTLevel(b));
        }
    },
    frequency: {
        key: 'frequency',
        displayText: 'Frequency',
        sort: (subjects: JoinedRawWKAssignmentAndSubject[]) => {

            function getFrequency(subject: RawWanikaniSubjectData) {
                return kanjiFrequencyLookupMap[subject.slug] ?? 1_000_000;
            }

            return subjects.sort((a, b) => getFrequency(a) - getFrequency(b));
        }
    },
};

export const colorByOptions = {
    srsStage: {
        key: 'srsStage',
        displayText: 'SRS Stage',
        color: (subject: JoinedRawWKAssignmentAndSubject) => getColorByWanikaniSrsStage(subject['srs_stage'])
    },
    itemType: {
        key: 'itemType',
        displayText: 'Item Type',
        color: (subject: JoinedRawWKAssignmentAndSubject) => {
            if (!subject['srs_stage'] && subject['srs_stage'] !== 0)
                return WanikaniColors.lockedGray;

            if (subject['srs_stage'] === 0)
                return WanikaniColors.lessonGray;

            return getColorByWanikaniSubjectType(subject.subjectType)
        }
    },
    jlpt: {
        key: 'jlpt',
        displayText: 'JLPT',
        color: (subject: JoinedRawWKAssignmentAndSubject) => getColorByJLPTLevel(kanjiJLPTLookupMap[subject.slug])
    },
};
