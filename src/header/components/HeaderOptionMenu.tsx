import {IconButton, Link, Menu, MenuItem} from "@mui/material";
import MoreIcon from '@mui/icons-material/MoreVert';
import React, {useState} from "react";
import {useWanikaniApiKey} from "../../hooks/useWanikaniApiKey";
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
// @ts-ignore
import {RoutePaths} from "../../Routes.jsx";
import {useNavigate} from "react-router";
import {useBunProApiKey} from "../../hooks/useBunProApiKey";
import {useAppVersion} from "../../hooks/useAppVersion";
import {AppUrls} from "../../Constants";
import {AccountCircle, Replay} from "@mui/icons-material";
import {ClearCacheDialog} from "./ClearCacheDialog";
import UserPreferencesDialog from "./UserPreferencesDialog";
import {AppStyles} from "../../util/TypeUtils";

const iconPaddingRight = '7px';

const styles: AppStyles = {
    logoutOption: {
        color: 'red',
        marginRight: iconPaddingRight
    },
    refreshOption: {
        color: '#5babf2',
        marginRight: iconPaddingRight
    },
    preferencesOption: {
        color: '#b0eaff',
        marginRight: iconPaddingRight
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
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [isClearCacheDialogOpen, setIsClearCacheDialogOpen] = useState(false);
    const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);
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

    const handleForceRefresh = () => {
        setIsClearCacheDialogOpen(true);
        setAnchorEl(null);
    }

    const handleUserPreferences = () => {
        setIsPreferencesDialogOpen(true);
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
                        <LogoutIcon fontSize={'small'} style={styles.logoutOption}/>
                        Logout of BunPro
                    </MenuItem>
                ) : null}

                {wanikaniApiKeyStore.apiKey ? (
                    <MenuItem onClick={handleWanikaniLogout}>
                        <LogoutIcon fontSize={'small'} style={styles.logoutOption}/>
                        Logout of Wanikani
                    </MenuItem>
                ) : null}

                <MenuItem onClick={handleForceRefresh}>
                    <Replay fontSize={'small'} style={styles.refreshOption}/>
                    Force Refresh
                </MenuItem>

                <MenuItem onClick={handleUserPreferences}>
                    <AccountCircle fontSize={'small'} style={styles.preferencesOption}/>
                    Preferences
                </MenuItem>

                <MenuItem onClick={goToAboutPage} divider={true}>
                    <InfoIcon fontSize={'small'} style={{marginRight: iconPaddingRight}}/>
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

            <ClearCacheDialog isOpen={isClearCacheDialogOpen}
                              onClose={() => setIsClearCacheDialogOpen(false)}
            />

            <UserPreferencesDialog isOpen={isPreferencesDialogOpen}
                                   onClose={() => setIsPreferencesDialogOpen(false)}
            />

        </>
    );
}

export default HeaderOptionMenu;
