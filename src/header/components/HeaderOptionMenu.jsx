import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreIcon from '@mui/icons-material/MoreVert';
import React from "react";
import { useWanikaniApiKey } from "../../hooks/useWanikaniApiKey.jsx";
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import { RoutePaths } from "../../Routes.jsx";
import { useNavigate } from "react-router";

function HeaderOptionMenu() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const { apiKey, setApiKey } = useWanikaniApiKey();
    const navigate = useNavigate();

    const handleWanikaniLogout = () => {
        setApiKey(null);
        setAnchorEl(null);
    }

    const goToAboutPage = () => {
        navigate(RoutePaths.aboutPage);
        setAnchorEl(null);
    }

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
                <MenuItem onClick={goToAboutPage}>
                    <InfoIcon style={{ marginRight: '3px' }} /> About
                </MenuItem>

                {apiKey ? (
                    <MenuItem onClick={handleWanikaniLogout}>
                        <LogoutIcon style={{ color: 'red', marginRight: '3px' }} />
                        Logout of Wanikani
                    </MenuItem>
                ) : null}

            </Menu>
        </>
    );
}

export default HeaderOptionMenu;