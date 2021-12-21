import {Card, CardContent} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/AnkiDecks.jsx";
import {useEffect, useState} from "react";
import AnkiApiService from "../service/AnkiApiService.js";
import {ankiColors} from "../../Constants.js";

// TODO: Need to find a way to account for Custom Study adding new cards and other funky scenarios
async function fetchDeckSummary(deckName) {
    const dueCards = await AnkiApiService.findCards(`"deck:${deckName}" prop:due=0`);
    const newCards = await AnkiApiService.findCards(`"deck:${deckName}" is:new`);
    let newCardsToReview = 0;
    if (newCards.length > 0) { // Check if there are still new cards left in the deck
        const newCardsAlreadyReviewed = await AnkiApiService.findCards(`"deck:${deckName}" introduced:1`);
        const deckConfig = await AnkiApiService.getDeckConfig(deckName);
        const cardsPerDay = deckConfig.new.perDay;

        // Check if user has already reviewed new cards
        if (cardsPerDay > 0 && cardsPerDay > newCardsAlreadyReviewed.length) {
            const newCardsToReviewToday = cardsPerDay - newCardsAlreadyReviewed.length;
            newCardsToReview = newCardsToReviewToday > newCards.length ? newCards.length : newCardsToReviewToday;
        }
    }
    return {
        deckName: deckName,
        dueCards: dueCards.length,
        newCards: newCardsToReview,
    };
}

async function fetchDeckSummaries(decks) {
    let requests = [];
    for (const deck of decks) {
        requests.push(fetchDeckSummary(deck));
    }
    return await Promise.all(requests);
}

function AnkiDeckSummaries() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const [deckData, setDeckData] = useState([]);

    useEffect(() => {
        let isSubscribed = true;

        fetchDeckSummaries(selectedDecks)
            .then(data => {
                if (!isSubscribed)
                    return;
                setDeckData(data);
            });
        return () => isSubscribed = false;
    }, []);


    return (
        <Card title={'Deck Summary'}>
            <CardContent>
                {deckData.map(data => (
                    <div key={data.deckName}>
                        <strong>{data.deckName}</strong>
                        <p>
                            <strong>
                                <span>Reviews: <span style={{color: ankiColors.green}}>{data.dueCards}</span></span>
                                <span style={{marginLeft: '15px'}}>New: <span style={{color: ankiColors.blue}}>{data.newCards}</span></span>
                            </strong>
                        </p>
                    </div>
                ))}


            </CardContent>
        </Card>
    );
}


export default AnkiDeckSummaries;
