import makeStyles from "@material-ui/core/styles/makeStyles";
import { useEffect } from "react";
import AnkiApiService from "./service/AnkiApiService";

const useStyles = makeStyles({
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
});


function AnkiDashboard() {
    const classes = useStyles();

    useEffect(() => {
        AnkiApiService.getDecks()
            .then(decks => {
                console.log(decks);
            });
    }, []);

    return (
        <div className={classes.container}>
            Anki coming soon(ish)
        </div>
    );
}

export default AnkiDashboard;