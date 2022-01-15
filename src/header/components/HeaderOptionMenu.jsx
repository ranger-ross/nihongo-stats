import {IconButton, Link, Menu, MenuItem} from "@mui/material";
import MoreIcon from '@mui/icons-material/MoreVert';
import React from "react";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey.jsx";
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import {RoutePaths} from "../../Routes.jsx";
import {useNavigate} from "react-router";
import {useBunProApiKey} from "../../hooks/useBunProApiKey.jsx";
import {useAppVersion} from "../../hooks/useAppVersion.jsx";
import {AppUrls} from "../../Constants.js";

const styles = {
    logoutOption: {
        color: 'red',
        marginRight: '3px'
    },
    versionText: {
        fontSize: 'small',
        color: 'gray',
    },
    whatsNewText: {
        fontSize: 'small',
    },
    versionMenuItem: {
        marginLeft: '15px',
        marginRight: '15px',
        marginTop: '5px',
        display: 'flex',
        justifyContent: 'space-between',
    },
};

function HeaderOptionMenu() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const wanikaniApiKeyStore = useWanikaniApiKey();
    const bunProApiKeyStore = useBunProApiKey();
    const navigate = useNavigate();
    const version = useAppVersion();

    const handleWanikaniLogout = () => {
        wanikaniApiKeyStore.setApiKey(null);
        setAnchorEl(null);
    }

    const handleBunProLogout = () => {
        bunProApiKeyStore.setApiKey(null);
        setAnchorEl(null);
    }

    const goToAboutPage = () => {
        navigate(RoutePaths.aboutPage.path);
        setAnchorEl(null);
    }

    return (
        <>
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
                <MoreIcon/>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
            >
                {bunProApiKeyStore.apiKey ? (
                    <MenuItem onClick={handleBunProLogout}>
                        <LogoutIcon style={styles.logoutOption}/>
                        Logout of BunPro
                    </MenuItem>
                ) : null}

                {wanikaniApiKeyStore.apiKey ? (
                    <MenuItem onClick={handleWanikaniLogout}>
                        <LogoutIcon style={styles.logoutOption}/>
                        Logout of Wanikani
                    </MenuItem>
                ) : null}

                <MenuItem onClick={goToAboutPage} divider={true}>
                    <InfoIcon style={{marginRight: '3px'}}/>
                    About
                </MenuItem>


                <div style={styles.versionMenuItem}>
                     <span style={styles.versionText}>
                        {version}
                    </span>
                    <Link target="_blank"
                          href={AppUrls.githubReleasesPage}
                          style={styles.whatsNewText}>
                        What's New
                    </Link>
                </div>

            </Menu>
        </>
    );
}

export default HeaderOptionMenu;