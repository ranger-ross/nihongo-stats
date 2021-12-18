import makeStyles from "@material-ui/core/styles/makeStyles";
import {useEffect, useState} from "react";
import AnkiReviewsChart from "./charts/AnkiReviewsChart";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";

const useStyles = makeStyles({
    container: {
        margin: '5px',
        display: 'flex',
        gap: '10px',
        flexDirection: 'column'
    }
});


function AnkiDashboard() {
    const classes = useStyles();
    const navigate = useNavigate();

    const [decks, setDecks] = useState(null);

    useEffect(() => {
        AnkiApiService.connect()
            .then(() => {
                AnkiApiService.getDeckNamesAndIds()
                    .then(data => {
                        console.log(data);
                        setDecks(data);
                    });
            })
            .catch(() => navigate(RoutePaths.ankiConnect, {replace: true}));


    }, []);

    return (
        <div className={classes.container}>
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

export default AnkiDashboard;