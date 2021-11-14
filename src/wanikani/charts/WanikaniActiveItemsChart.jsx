import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Badge, Card, CardContent, Link, Tooltip, Typography } from "@material-ui/core";
import { wanikaniColors } from "../../Constants";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Check } from "@mui/icons-material";

const racialColor = wanikaniColors.blue;
const kanjiColor = wanikaniColors.pink;
const vocabularyColor = wanikaniColors.purple;

const baseTile = {
    width: 'fit-content',
    textAlign: 'center',
    padding: '5px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: '5px',
    boxShadow: 'rgba(0, 0, 0, 0.3) 5px 4px 10px',
    border: 'solid #303030 1px',
    color: 'white',

}

const useStyles = makeStyles({
    lockedTile: {
        ...baseTile,
        background: '#b5b5b5',
    },
    unstartedTile: {
        ...baseTile,
        background: '#686868',
    },
    radicalTile: {
        ...baseTile,
        background: racialColor,
    },
    kanjiTile: {
        ...baseTile,
        background: kanjiColor,
    },
    vocabularyTile: {
        ...baseTile,
        background: vocabularyColor,
    }
});

function ItemTile({ text, type, link, meaning, srsLevel, isStarted, isAvailable }) {
    const classes = useStyles();
    let cls = classes.lockedTile;
    if (isStarted) {
        switch (type) {
            case 'radical':
                cls = classes.radicalTile;
                break;
            case 'kanji':
                cls = classes.kanjiTile;
                break;
            case 'vocabulary':
                cls = classes.vocabularyTile;
                break;
        }
    } else if (isAvailable) {
        cls = classes.unstartedTile;
    }

    return (
        <Tooltip title={
            <div>
                <p>Meaning: {meaning}</p>
                {!!srsLevel ? (<p>SRS Level: {srsLevel}</p>) : null}
            </div>
        } placement={'top'}>
            <Link href={link}
                underline="none"
                target="_blank"
                rel="noreferrer"
            >

                {srsLevel > 4 ? (
                    <Badge badgeContent={
                        <Check sx={{ fontSize: 15 }} style={{ color: 'lime' }} />
                    }>
                        <div className={cls}>{text}</div>
                    </Badge>
                ) : (
                    <div className={cls}>{text}</div>
                )}

            </Link>
        </Tooltip>
    );
}

function createAssignmentMap(subjects) {
    let map = {};

    for (const subject of subjects) {
        map[subject.data['subject_id']] = subject;
    }

    return map;
}

function combineAssignmentAndSubject(assignment, subject) {
    return {
        ...subject.data,
        ...assignment?.data,
        hasAssignment: !!assignment,
        subjectId: subject.id,
    };
}

async function fetchData(apiKey) {
    const user = await WanikaniApiService.getUser(apiKey);
    const currentLevel = user.data.level;
    const subjects = (await WanikaniApiService.getSubjects(apiKey))
        .filter(subject => subject.data.level === currentLevel);

    let assignments = (await WanikaniApiService.getAssignmentsForLevel(apiKey, currentLevel)).data;
    assignments = createAssignmentMap(assignments);

    const radicals = subjects
        .filter(subject => subject.object === 'radical')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const kanji = subjects
        .filter(subject => subject.object === 'kanji')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    const vocabulary = subjects
        .filter(subject => subject.object === 'vocabulary')
        .map(s => combineAssignmentAndSubject(assignments[s.id], s));
    return {
        radicals,
        kanji,
        vocabulary
    };
}

function WanikaniActiveItemsChart() {
    const { apiKey } = useWanikaniApiKey();
    const [data, setData] = useState({
        radicals: [],
        kanji: [],
        vocabulary: [],
    })

    useEffect(() => {
        fetchData(apiKey)
            .then(setData)
            .catch(console.error);
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h5'}
                    color={'textPrimary'}
                    style={{ paddingBottom: '10px' }}
                >
                    Radicals
                </Typography>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.radicals.map(subject => (
                        <ItemTile key={subject.subjectId + '-radical'}
                            text={subject.characters}
                            isStarted={subject['started_at']}
                            isAvailable={subject.hasAssignment}
                            link={subject['document_url']}
                            meaning={subject.meanings.map(m => m.meaning).join(', ')}
                            srsLevel={subject['srs_stage']}
                            type={'radical'}
                        />
                    ))}
                </div>

                <Typography variant={'h5'}
                    color={'textPrimary'}
                    style={{ paddingBottom: '10px', paddingTop: '15px' }}
                >
                    Kanji
                </Typography>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.kanji.map(subject => (
                        <ItemTile key={subject.subjectId + '-kaji'}
                            text={subject.characters}
                            isStarted={subject['started_at']}
                            isAvailable={subject.hasAssignment}
                            link={subject['document_url']}
                            meaning={subject.meanings.map(m => m.meaning).join(', ')}
                            srsLevel={subject['srs_stage']}
                            type={'kanji'}
                        />
                    ))}

                </div>

                <Typography variant={'h5'}
                    color={'textPrimary'}
                    style={{ paddingBottom: '10px', paddingTop: '15px' }}
                >
                    Vocabulary
                </Typography>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.vocabulary.map(subject => (
                        <ItemTile key={subject.subjectId + '-vocabulary'}
                            text={subject.characters}
                            isStarted={subject['started_at']}
                            isAvailable={subject.hasAssignment}
                            link={subject['document_url']}
                            meaning={subject.meanings.map(m => m.meaning).join(', ')}
                            srsLevel={subject['srs_stage']}
                            type={'vocabulary'}
                        />
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}

export default WanikaniActiveItemsChart;