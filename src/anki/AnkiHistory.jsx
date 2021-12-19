import {useEffect, useState} from "react";
import AnkiReviewsChart from "./charts/AnkiReviewsChart";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";

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

    const [decks, setDecks] = useState(null);

    useEffect(() => {
        AnkiApiService.connect()
            .then(() => {
                AnkiApiService.getDeckNamesAndIds()
                    .then(data => {
                        console.log(data);
                        setDecks(data.filter(deck => deck.name.toLowerCase() !== 'default'));
                    });
            })
            .catch(() => navigate(RoutePaths.ankiConnect, {replace: true}));


    }, []);

    return (
        <div style={styles.container}>
            {decks ? (
                <>
                    <AnkiReviewsChart
                        deckNames={decks.map(deck => deck.name)}
                        showTotals={true}
                    />

                    <AnkiReviewsChart
                        deckNames={decks.map(deck => deck.name)}
                        showTotals={false}
                    />
                </>
            ) : null}
        </div>
    );
}

export default AnkiHistory;