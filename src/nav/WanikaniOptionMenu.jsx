import { IconButton, Menu, MenuItem } from "@material-ui/core";
import MoreIcon from '@mui/icons-material/MoreVert';
import React from "react";
import { useWanikaniApiKey } from "../wanikani/stores/WanikaniApiKeyStore.js";


function WanikaniOptionMenu() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const { setApiKey } = useWanikaniApiKey();

    const handleLogout = () => {
        setApiKey(null);
    };
    return (
        <>
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
                <MoreIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={handleLogout}>
                    Logout
                </MenuItem>
            </Menu>
        </>
    );
}

export default WanikaniOptionMenu;