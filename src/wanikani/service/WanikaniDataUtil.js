export function createSubjectMap(subjects) {
    let map = {};
    for (const subject of subjects) {
        map[subject.id] = subject;
    }
    return map;
}

export function createAssignmentMap(subjects) {
    let map = {};

    for (const subject of subjects) {
        map[subject.data['subject_id']] = subject;
    }

    return map;
}

export function combineAssignmentAndSubject(assignment, subject) {
    return {
        ...subject.data,
        ...assignment?.data,
        hasAssignment: !!assignment,
        subjectId: subject.id,

        // prefer this over 'subject_type'
        // if a subject has not been assigned it will not have a subject_type
        subjectType: subject.object,
    };
}

export function isSubjectHidden(subject) {
    return !!subject && !!subject.data && subject.data['hidden_at'];
}