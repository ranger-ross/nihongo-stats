import makeStyles from "@material-ui/core/styles/makeStyles";
import { useEffect, useState } from "react";
import AnkiTotalReviewsChart from "./charts/AnkiTotalReviewsChart";
import AnkiApiService from "./service/AnkiApiService";

const useStyles = makeStyles({
    container: {
        margin: '5px'
    }
});


function AnkiDashboard() {
    const classes = useStyles();

    const [decks, setDecks] = useState();

    useEffect(() => {
        AnkiApiService.getDeckNamesAndIds()
            .then(data => {
                console.log(data);
                setDecks(data);
            });
    }, []);

    return (
        <div className={classes.container}>

            <AnkiTotalReviewsChart deckNames={["Core 2k/6k Optimized Japanese Vocabulary"]} />

        </div>
    );
}

export default AnkiDashboard;