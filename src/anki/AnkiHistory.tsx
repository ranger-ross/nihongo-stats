import AnkiReviewsChart from "./components/AnkiReviewsChart";
import {useSelectedAnkiDecks} from "../hooks/useSelectedAnkiDecks";
import AnkiApiProvider from "./components/AnkiApiProvider";
import AnkiTotalCardsHistoryChart from "./components/AnkiTotalCardsHistoryChart";
import AnkiCardBreakDownHistoryChart from "./components/AnkiCardBreakDownHistoryChart";
import {AppStyles} from "../util/TypeUtils";

const styles: AppStyles = {
    container: {
        margin: '5px',
        display: 'flex',
        gap: '10px',
        flexDirection: 'column'
    }
};


function AnkiHistory() {
    const {selectedDecks} = useSelectedAnkiDecks();

    return (
        <AnkiApiProvider>
            <div style={styles.container}>
                {selectedDecks?.length > 0 ? (
                    <>
                        <AnkiReviewsChart
                            deckNames={selectedDecks}
                            showTotals={true}
                        />

                        <AnkiCardBreakDownHistoryChart
                            deckNames={selectedDecks}
                        />

                        <AnkiReviewsChart
                            deckNames={selectedDecks}
                            showTotals={false}
                        />

                        <AnkiTotalCardsHistoryChart
                            deckNames={selectedDecks}
                        />
                    </>
                ) : null}
            </div>
        </AnkiApiProvider>
    );
}

export default AnkiHistory;
