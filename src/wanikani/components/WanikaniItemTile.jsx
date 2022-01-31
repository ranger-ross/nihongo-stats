import {Tooltip} from "@mui/material";

function useTileStyle(color, size) { // 10 is base
    const topPadding = (size / 2) + 'px';
    const sidePadding = size + 'px';
    return {
        width: 'fit-content',
        textAlign: 'center',
        padding: topPadding,
        paddingLeft: sidePadding,
        paddingRight: sidePadding,
        borderRadius: Math.max(size / 2, 5) + 'px',
        boxShadow: 'rgba(0, 0, 0, 0.3) 5px 4px 10px',
        border: 'solid #303030 1px',
        color: 'white',
        textDecoration: 'none',
        background: color
    }
}

function WanikaniItemTile({text, link, meaning, srsLevel, color, size = 10}) {
    const style = useTileStyle(color, size);

    return (
        <Tooltip
            title={
                <>
                    <p>Meaning: {meaning}</p>
                    {!!srsLevel ? (<p>SRS Level: {srsLevel}</p>) : null}
                </>
            }
            placement={'top'}
        >
            <a href={link} target="_blank" style={style} rel="noreferrer">{text}</a>
        </Tooltip>
    );
}

export default WanikaniItemTile;