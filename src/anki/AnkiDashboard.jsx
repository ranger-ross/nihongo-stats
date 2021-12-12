import makeStyles from "@material-ui/core/styles/makeStyles";
import { useEffect, useState } from "react";
import AnkiApiService from "./service/AnkiApiService";

const useStyles = makeStyles({
    container: {
        textAlign: 'center',
        marginTop: '15vh'
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
            Anki Decks

            {decks?.map(deck => (
                <div key={deck.id}>
                    {deck.name}
                </div>
            ))}
            
        </div>
    );
}

export default AnkiDashboard;