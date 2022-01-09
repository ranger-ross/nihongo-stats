export function createSubjectMap(subjects) {
    let map = {};
    for (const subject of subjects) {
        map[subject.id] = subject;
    }
    return map;
}