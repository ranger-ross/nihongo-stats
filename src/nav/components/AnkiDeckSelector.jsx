import {Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select} from "@mui/material";
import {useAnkiDecks, useSelectedAnkiDecks} from "../../hooks/AnkiDecks.jsx";

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
    const [selectedDecks, setSelectedDecks] = useSelectedAnkiDecks();

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
                    <MenuItem key={deck} value={deck}>
                        <Checkbox checked={selectedDecks.indexOf(deck) > -1}/>
                        <ListItemText primary={deck}/>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}


export default AnkiDeckSelector;