import { GridLegacy, Typography, useTheme } from "@mui/material";
import HeaderOptionMenu from './components/HeaderOptionMenu'

const useStyles = (theme: any) => ({
    container: {
        padding: '2px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
        background: theme.palette.background.paper,
        justifyContent: 'space-between',
    },
    title: {
        margin: '5px'
    },
    alpha: {
        fontSize: 'medium',
        color: 'red',
        verticalAlign: 'super',
    }
});


function AppHeader() {
    const theme = useTheme();
    const styles = useStyles(theme);
    return (
        <GridLegacy container style={styles.container}>
            <GridLegacy item>
                <Typography variant={'h4'} color={'textPrimary'} style={styles.title}>
                    Nihongo Stats <span style={styles.alpha}>Alpha</span>
                </Typography>
            </GridLegacy>
            <HeaderOptionMenu />
        </GridLegacy>
    );
}

export default AppHeader;
