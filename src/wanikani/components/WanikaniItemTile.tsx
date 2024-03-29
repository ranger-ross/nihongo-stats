import {Tooltip} from "@mui/material";
import {kanjiFrequencyLookupMap, kanjiJLPTLookupMap} from "../../util/KanjiDataUtil";
import {getWanikaniSrsStageDescription} from "../service/WanikaniDataUtil";
import {CSSProperties} from "react";
import {WanikaniSubjectCharacterImage, WanikaniSubjectReading} from "../models/WanikaniSubject";
import {WANIKANI_COLORS_WITH_BLACK_TEXT} from "../../Constants";

function useTileStyle(color: string, size: number): CSSProperties { // 10 is base
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
        color: WANIKANI_COLORS_WITH_BLACK_TEXT.has(color) ? 'black' : 'white',
        textDecoration: 'none',
        background: color,
    };
}

function ValueLabel({label, value}: { label: string, value?: string | number | null }) {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
            <div style={{fontSize: 'large'}}>{label}</div>
            <div style={{fontSize: 'large'}}>{value}</div>
        </div>
    );
}

function formatReadings(readings?: WanikaniSubjectReading[]) {
    if (!readings)
        return null;
    return readings.map(r => r.reading).join(', ');
}

function formatNextReviewDate(date: Date) {
    if (!date)
        return null;
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString('en-US', {hour: 'numeric'});
}

type WanikaniItemTile = {
    text: string,
    link: string,
    meaning: string,
    srsLevel: number,
    color: string,
    type: string,
    level: number,
    readings?: WanikaniSubjectReading[],
    characterImages?: WanikaniSubjectCharacterImage[],
    nextReviewDate: Date | null,
    size: number,
};

function WanikaniItemTile({
                              text,
                              link,
                              meaning,
                              srsLevel,
                              color,
                              type,
                              level,
                              readings,
                              nextReviewDate,
                              characterImages,
                              size = 10
                          }: WanikaniItemTile) {
    const style = useTileStyle(color, size);

    const reading = formatReadings(readings)
    const frequency = kanjiFrequencyLookupMap[text];
    const jlptLevel = kanjiJLPTLookupMap[text];

    // Add delay to make the tooltip not appear when user quick hovers over multiple tiles
    // With this, it's a bit annoying to navigate because the tooltip gets in the way of other tiles
    const tooltipDelay = 125;

    // Extra logic to fetch character images for radicals that do not have a "characters" attribute
    const imageUrls = !text ? characterImages?.filter(image => image.contentType === "image/png").map(image => image.url) : null;
    const imageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;
    const imageFilter = WANIKANI_COLORS_WITH_BLACK_TEXT.has(color)
        ? 'invert(0%)' // Black
        : 'invert(100%)'; // White

    return (
        <Tooltip
            enterDelay={tooltipDelay}
            enterNextDelay={tooltipDelay}
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
            <a href={link} target="_blank" style={style} rel="noreferrer">
                {text ? (
                    text
                ) : (
                    <img
                        src={imageUrl!}
                        height={20}
                        style={{
                            paddingTop: '5px',
                            filter: imageFilter
                        }}
                        alt="?"
                    />
                )}
            </a>
        </Tooltip>
    );
}

export default WanikaniItemTile;
