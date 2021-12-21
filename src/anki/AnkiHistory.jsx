import {useEffect} from "react";
import AnkiReviewsChart from "./charts/AnkiReviewsChart";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";
import {useSelectedAnkiDecks} from "../hooks/AnkiDecks.jsx";

const styles = {
    container: {
        margin: '5px',
        display: 'flex',
        gap: '10px',
        flexDirection: 'column'
    }
};


function AnkiHistory() {
    const navigate = useNavigate();
    const {selectedDecks} = useSelectedAnkiDecks();

    useEffect(() => {
        AnkiApiService.connect()
            .catch(() => navigate(RoutePaths.ankiConnect, {replace: true}));
    }, []);

    return (
        <div style={styles.container}>
            {selectedDecks?.length > 0 ? (
                <>
                    <AnkiReviewsChart
                        deckNames={selectedDecks}
                        showTotals={true}
                    />

                    <AnkiReviewsChart
                        deckNames={selectedDecks}
                        showTotals={false}
                    />
                </>
            ) : null}
        </div>
    );
}

export default AnkiHistory;