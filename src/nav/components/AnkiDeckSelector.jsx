import {Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select} from "@mui/material";
import {useEffect, useState} from "react";
import AnkiApiService from "../../anki/service/AnkiApiService.js";

const ITEM_HEIGHT = 40;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function AnkiDeckSelector() {
    const [decks, setDecks] = useState([]);
    const [selectedDecks, setSelectedDecks] = useState([]);

    useEffect(() => {
        let isSubscribed = true;
        AnkiApiService.getDeckNamesAndIds()
            .then(data => {
                if (!isSubscribed)
                    return;
                setDecks([...data, {name: 'deck1'}, {name: 'deck2'}].filter(deck => deck.name.toLowerCase() !== 'default'));
            });
        return () => isSubscribed = false;
    }, []);


    const handleChange = (event) => {
        const {target: {value}} = event;
        setSelectedDecks(typeof value === 'string' ? value.split(',') : value);
    };

    return (
        <FormControl sx={{width: 300, marginLeft: 1}}>
            <InputLabel>Selected Decks</InputLabel>
            <Select
                multiple
                size={'small'}
                value={selectedDecks}
                onChange={handleChange}
                input={<OutlinedInput label="Selected Decks"/>}
                renderValue={(selected) => selected.length === decks.length ? 'All' : selected.join(', ')}
                MenuProps={MenuProps}
            >
                {decks.map((deck) => (
                    <MenuItem key={deck.name} value={deck.name}>
                        <Checkbox checked={selectedDecks.indexOf(deck.name) > -1}/>
                        <ListItemText primary={deck.name}/>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}


export default AnkiDeckSelector;