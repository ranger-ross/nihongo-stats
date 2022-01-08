import {Tooltip} from "@mui/material";
import {WanikaniColors} from "../../Constants";
import VisibilitySensor from "react-visibility-sensor"
import {useState, useMemo} from "react";

const racialColor = WanikaniColors.blue;
const kanjiColor = WanikaniColors.pink;
const vocabularyColor = WanikaniColors.purple;

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

const styles = {
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
};

function WanikaniItemTile({text, type, link, meaning, srsLevel, isStarted, isAvailable}) {
    const [isLoaded, setIsLoaded] = useState(false);

    let style = styles.lockedTile;
    if (isStarted) {
        switch (type) {
            case 'radical':
                style = styles.radicalTile;
                break;
            case 'kanji':
                style = styles.kanjiTile;
                break;
            case 'vocabulary':
                style = styles.vocabularyTile;
                break;
        }
    } else if (isAvailable) {
        style = styles.unstartedTile;
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
                    <a href={link} target="_blank" style={style}>{text}</a>
                </Tooltip>
            ) : <div style={styles.placeholderDiv}>-</div>}
        </VisibilitySensor>
    );
}

export default WanikaniItemTile;