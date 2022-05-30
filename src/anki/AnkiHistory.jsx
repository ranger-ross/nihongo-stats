import AnkiReviewsChart from "./components/AnkiReviewsChart.jsx";
import {useSelectedAnkiDecks} from "../hooks/useSelectedAnkiDecks.tsx";
import AnkiApiProvider from "./components/AnkiApiProvider.jsx";
import AnkiTotalCardsHistoryChart from "./components/AnkiTotalCardsHistoryChart.jsx";
import AnkiCardBreakDownHistoryChart from "./components/AnkiCardBreakDownHistoryChart.jsx";

const styles = {
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
                            showTotals={true}
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
