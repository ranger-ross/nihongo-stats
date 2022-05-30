import {Card, CardContent} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.tsx";
import {useEffect, useState} from "react";
import AnkiDeckSummaries from "./AnkiDeckSummaries.jsx";
import {fetchAnkiDeckSummaries} from "../service/AnkiDataUtil.js";


function AnkiDeckSummariesTile() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [deckData, setDeckData] = useState([]);

    useEffect(() => {
        let isSubscribed = true;

        fetchAnkiDeckSummaries(selectedDecks)
            .then(data => {
                if (!isSubscribed)
                    return;
                setDeckData(data);
            });
        return () => isSubscribed = false;
    }, [selectedDecks]);


    return (
        <Card title={'Deck Summary'}>
            <CardContent>
                <AnkiDeckSummaries deckData={deckData}/>
            </CardContent>
        </Card>
    );
}


export default AnkiDeckSummariesTile;
