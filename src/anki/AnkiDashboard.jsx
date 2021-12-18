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

    const [decks, setDecks] = useState();

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
            <AnkiReviewsChart
                deckNames={["Core 2k/6k Optimized Japanese Vocabulary"]}
                showTotals={true}
            />

            <AnkiReviewsChart
                deckNames={["Core 2k/6k Optimized Japanese Vocabulary"]}
                showTotals={false}
            />
        </div>
    );
}

export default AnkiDashboard;