import { Tooltip } from "@material-ui/core";
import { wanikaniColors } from "../../Constants";
import makeStyles from "@material-ui/core/styles/makeStyles";
import VisibilitySensor from "react-visibility-sensor"
import { useState, useMemo } from "react";

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
    textDecoration: 'none',
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
    },
    placeholderDiv: {
        height: '35px',
        width: '35px',
        color: '#00000011'
    }
});

function WanikaniItemTile({ text, type, link, meaning, srsLevel, isStarted, isAvailable }) {
    const classes = useStyles();
    const [isLoaded, setIsLoaded] = useState(false);

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
        <VisibilitySensor partialVisibility={true} onChange={(isVisible) => isVisible ? setIsLoaded(true) : null}>
            {isLoaded ? (
                <Tooltip title={
                    <>
                        <p>Meaning: {meaning}</p>
                        {!!srsLevel ? (<p>SRS Level: {srsLevel}</p>) : null}
                    </>
                } placement={'top'}>
                    <a href={link} target="_blank" className={cls}>{text}</a>
                </Tooltip>
            ) : <div className={classes.placeholderDiv}>-</div>}
        </VisibilitySensor>
    );
}

export default WanikaniItemTile;