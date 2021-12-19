import {Grid, Typography, useTheme} from "@mui/material";
import HeaderOptionMenu from './components/HeaderOptionMenu'


function AppHeader() {
    const theme = useTheme();
    return (
        <Grid container style={{
            padding: '2px',
            boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
            background: theme.palette.background.paper,
            justifyContent: 'space-between',
        }}>
            <Grid item>
                <Typography variant={'h4'} color={'textPrimary'} style={{margin: '5px'}}>
                    Nihongo Stats
                </Typography>
            </Grid>
            <HeaderOptionMenu/>
        </Grid>
    );
}

export default AppHeader;