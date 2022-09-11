import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks";
import AnkiDeckSummaries from "./AnkiDeckSummaries";
import {SimpleCard} from "../../shared/SimpleCard";
import {useAnkiDeckSummaries} from "../service/AnkiQueries";


function AnkiDeckSummariesTile() {
    const {selectedDecks} = useSelectedAnkiDecks();
    const {data, isSuccess, error, isLoading} = useAnkiDeckSummaries(selectedDecks);

    error && console.error(error);

    if (!isSuccess) {
        return (
            <SimpleCard title={'Deck Summary'}>
                An error occurred
            </SimpleCard>
        );
    }

    if (isLoading) {
        return (
            <SimpleCard title={'Deck Summary'}>
                Loading...
            </SimpleCard>
        );
    }

    return (
        <SimpleCard title={'Deck Summary'}>
            <AnkiDeckSummaries deckData={data}/>
        </SimpleCard>
    );
}


export default AnkiDeckSummariesTile;
