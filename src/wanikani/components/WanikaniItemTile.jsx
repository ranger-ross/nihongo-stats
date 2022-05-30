import {Tooltip} from "@mui/material";
import {kanjiFrequencyLookupMap, kanjiJLPTLookupMap} from "../../util/KanjiDataUtil.js";
import {getWanikaniSrsStageDescription} from "../service/WanikaniDataUtil.js";

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

function ValueLabel({label, value}) {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
            <div style={{fontSize: 'large'}}>{label}</div>
            <div style={{fontSize: 'large'}}>{value}</div>
        </div>
    );
}

function formatReadings(readings) {
    if (!readings)
        return null;
    return readings.map(r => r.reading).join(', ');
}

function formatNextReviewDate(date) {
    if (!date)
        return null;
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString('en-US', {hour: 'numeric'});
}

function WanikaniItemTile({text, link, meaning, srsLevel, color, type, level, readings, nextReviewDate, size = 10}) {
    const style = useTileStyle(color, size);

    const reading = formatReadings(readings)
    const frequency = kanjiFrequencyLookupMap[text];
    const jlptLevel = kanjiJLPTLookupMap[text];

    return (
        <Tooltip
            title={
                <div style={{minWidth: '265px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div style={{fontSize: 'xx-large', fontWeight: 'bold'}}>{text}</div>
                    </div>
                    {!!reading ? (<ValueLabel label={reading}/>) : null}
                    <br/>

                    {!!meaning ? (<ValueLabel label={meaning}/>) : null}

                    <br/>

                    {type == 'kanji' && !!frequency ? (<ValueLabel label={'Frequency'} value={frequency}/>) : null}
                    {type == 'kanji' && !!jlptLevel ? (<ValueLabel label={'JLPT'} value={jlptLevel}/>) : null}
                    {!!type ? (<ValueLabel label={'Type'} value={type[0].toUpperCase() + type.substr(1)}/>) : null}
                    {!!level ? (<ValueLabel label={'Wanikani Level'} value={level}/>) : null}
                    <ValueLabel label={'SRS Level'} value={getWanikaniSrsStageDescription(srsLevel)}/>
                    {!!nextReviewDate ? (<ValueLabel label={'Next Review'}
                                                     value={formatNextReviewDate(nextReviewDate)}/>) : null}
                </div>
            }
            placement={'top'}
        >
            <a href={link} target="_blank" style={style} rel="noreferrer">{text}</a>
        </Tooltip>
    );
}

export default WanikaniItemTile;
