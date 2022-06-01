import {Card, CardContent} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import {useEffect, useState} from "react";
import AnkiDeckSummaries from "./AnkiDeckSummaries";
import {AnkiDeckSummary, fetchAnkiDeckSummaries} from "../service/AnkiDataUtil";


function AnkiDeckSummariesTile() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [deckData, setDeckData] = useState<AnkiDeckSummary[]>([]);

    useEffect(() => {
        let isSubscribed = true;

        fetchAnkiDeckSummaries(selectedDecks)
            .then(data => {
                if (!isSubscribed)
                    return;
                setDeckData(data);
            });
        return () => {
            isSubscribed = false;
        };
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
