import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {useEffect, useState} from "react";
import WanikaniApiService from "../service/WanikaniApiService.js";

const now = new Date();

function median(arr) {
    const mid = Math.floor(arr.length / 2);
    return arr.length === 0 ? 0 : arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function countComponent(progressions, componentLevel, itemLevel) {
    // For items in future levels, don't count passing time for components on preceding levels
    return !(itemLevel > progressions[progressions.length - 1].level && componentLevel < itemLevel);
}

function levelDuration(level) {
    return new Date(level.passed_at || level.abandoned_at).subtractDate(new Date(level.unlocked_at));
}

const getLater = function (a, b) {
    return new Date(Math.max(a, b));
};

const getHypothetical = function (fastest, isCurrent) {
    // const s = isCurrent ? "current" : fastest;
    // let x = getID("hypothetical", "checked") ? "-" + s : "";
    // return getID("speed" + x, "value") * 3600 || 864000;
    return 864000;
}

Date.prototype.add = function (seconds) {
    return this.setTime(this.getTime() + (seconds * 1000)) && this;
};

Date.prototype.subtractDate = function (date) {
    return (this.getTime() - date.getTime()) / 1000;
};


function project(stats, maxLevel, progressions, isHidePast = false) {
    const current = progressions[progressions.length - 1];
    const levels = progressions.slice().concat(Array.from({length: maxLevel - current.level + 2},
        (_, i) => ({level: current.level + 1 + i})));
    const medianSpeed = median(progressions.slice(0, -1).map(levelDuration).sort((a, b) => a - b));
    const time = stats.map(d => d.length && d.sort((a, b) => a[0] - b[0])[Math.ceil(d.length * 0.9) - 1][0]);

    let unlocked = new Date(now);
    let currentReached = false;
    let real = null;
    let fastest = null; // Keep track of the fast possible time
    let given = null;   // Keep track of the hypothetical time
    let output = [];

    for (const levelData of levels) {
        if (levelData === current)
            currentReached = true;
        if (isHidePast && !currentReached)
            continue;

        const level = levelData.level;
        const _fastest = new Date(fastest || now).add(time[level - 1]);
        const _real = getLater(new Date(real || unlocked).add(level === maxLevel + 2 ? time[level - 1] : medianSpeed), _fastest);

        const hypothetical = getHypothetical(time[level - 1], level === current.level + 1);
        const _given = getLater(new Date(given || unlocked).add(level === maxLevel + 2 ? time[level - 1] : hypothetical), _fastest);

        if (levelData.unlocked_at) {
            unlocked = new Date(levelData.unlocked_at);
        } else if (level <= maxLevel) {
            fastest = _fastest;
            real = _real;
            given = _given;
            output[level] = {
                level,
                fastest: _fastest,
                real: _real,
                given: _given
            };
        } else {
            output[level] = {
                level,
                fastest: _fastest,
                real: _real,
                given: _given
            };
        }
    }
    return output;
}


function createData(name, calories, fat, carbs, protein) {
    return {name, calories, fat, carbs, protein};
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

function createSrsSystemMap(systems) {
    let map = {};
    for (const system of systems) {
        map[system.id] = system
    }
    return map;
}

async function fetchData() {

    const user = await WanikaniApiService.getUser();
    const levelProgress = await WanikaniApiService.getLevelProgress();
    const subjects = await WanikaniApiService.getSubjects();
    const spacedRepetitionSystems = await WanikaniApiService.getSpacedRepetitionSystems();

    const maxLevel = user.data.subscription.max_level_granted;
    const progressions = levelProgress.data.map(level => level.data);
    const systems = createSrsSystemMap(spacedRepetitionSystems.data);

    const time = function (item, burn) {
        if (!item.assignments?.[burn ? "burned_at" : "passed_at"]) {
            let interval = item.assignments?.['"available_at"'] ?
                Math.max(0, (new Date(item.assignments.available_at)).subtractDate(now)) : 0;
            const srs = systems[item.data.spaced_repetition_system_id].data;
            const target = srs[burn ? "burning_stage_position" : "passing_stage_position"];
            for (let i = (item.assignments?.["srs_stage"] || 0) + 1; i < target; i++) {
                interval += srs.stages[i].interval;
            }
            return interval;
        }
        return (new Date(item.assignments[burn ? "burned_at" : "passed_at"])).subtractDate(now);
    };

    const unlock = (item, itemLevel, burn) => {
        return countComponent(progressions, item.data.level, itemLevel) ?
            (item.object === "radical" ? 0 : item.data.component_subject_ids
                .map(id => Math.max(0, unlock(subjects.find(o => o.id === id), item.data.level)))
                .reduce((a, b) => Math.max(a, b))) + time(item, burn) : 0;
    };

    let stats = Array.from(Array(maxLevel + 1), () => []);
    for (const item of subjects) {
        if (item.data.hidden_at || item.object !== "kanji") continue;
        stats[item.data.level].push([unlock(item, item.data.level, false), item]);
    }

    let burnStats = subjects
        .filter(item => !item.data.hidden_at)
        .map(item => unlock(item, item.data.level, true));

    stats.push([[burnStats.sort((a, b) => a - b)[burnStats.length - 1], burnStats]]);

    return project(stats, maxLevel, progressions);
}

function WanikaniLevelProjectionsTable() {


    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData().then(data => {
            setData(data)
        });
    }, []);

    console.log(data);


    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}}>
                <TableHead>
                    <TableRow>
                        <TableCell>Level</TableCell>
                        <TableCell>Real/Predicted</TableCell>
                        <TableCell>Fastest</TableCell>
                        <TableCell>Hypothetical</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.level}>
                            <TableCell>{row.level}</TableCell>
                            <TableCell>{row.real.toLocaleDateString()}</TableCell>
                            <TableCell>{row.fastest.toLocaleDateString()}</TableCell>
                            <TableCell>{row.given.toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}


export default WanikaniLevelProjectionsTable;
