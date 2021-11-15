import { Badge, Link, Tooltip } from "@material-ui/core";
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

function WanikaniItemTile({ text, type, link, meaning, srsLevel, isStarted, isAvailable }) {
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

export default WanikaniItemTile;