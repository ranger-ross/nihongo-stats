import {Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select} from "@mui/material";
import {useSelectedAnkiDecks} from "../../hooks/useSelectedAnkiDecks.tsx";
import {useEffect} from "react";
import {useAnkiDecks} from "../../hooks/useAnkiDecks.tsx";

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
    const [decks] = useAnkiDecks();
    const {selectedDecks, setSelectedDecks} = useSelectedAnkiDecks();

    useEffect(() => {
        if (!selectedDecks || selectedDecks.length === 0) {
            setSelectedDecks(decks);
        }
    }, [decks]);

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
                    <MenuItem key={deck} value={deck}
                              disabled={selectedDecks.length < 2 && selectedDecks.indexOf(deck) > -1}
                    >
                        <Checkbox checked={selectedDecks.indexOf(deck) > -1}/>
                        <ListItemText primary={deck}/>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}


export default AnkiDeckSelector;
