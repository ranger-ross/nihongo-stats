import { Grid, Typography } from "@material-ui/core";
import createStyles from "@material-ui/core/styles/createStyles";
import makeStyles from "@material-ui/core/styles/makeStyles";
import HeaderOptionMenu from './components/HeaderOptionMenu'


const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            padding: '2px',
            boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
            background: theme.palette.background.paper,
            justifyContent: 'space-between',
        }
    }),
);

function AppHeader() {
    const classes = useStyles();
    return (
        <Grid container className={classes.container}>
            <Grid item>
                <Typography variant={'h4'} color={'textPrimary'} style={{ margin: '5px' }}>
                    Nihongo Stats
                </Typography>
            </Grid>
            <HeaderOptionMenu />
        </Grid>
    );
}

export default AppHeader;