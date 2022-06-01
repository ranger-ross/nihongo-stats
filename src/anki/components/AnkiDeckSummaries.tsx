import {AnkiColors} from "../../Constants";
import {AnkiDeckSummary} from "../service/AnkiDataUtil";

type AnkiDeckSummariesProps = {
    deckData: AnkiDeckSummary[]
};

/**
 * Use AnkiDataUtil.fetchAnkiDeckSummaries() to get data
 */
function AnkiDeckSummaries({deckData}: AnkiDeckSummariesProps) {
    return deckData.map(data => (
        <div key={data.deckName}>
            <strong>{data.deckName}</strong>
            <p style={{marginTop: '3px', marginBottom: '10px'}}>
                <strong>
                    <span style={{color: 'lightgray'}}>Reviews: <span
                        style={{color: AnkiColors.lightGreen}}>{data.dueCards}</span></span>
                    <span style={{marginLeft: '15px', color: 'lightgray'}}>New: <span
                        style={{color: AnkiColors.blue}}>{data.newCards}</span></span>
                </strong>
            </p>
        </div>
    ));
}

export default AnkiDeckSummaries;
