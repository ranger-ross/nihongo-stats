import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
});


function AnkiDashboard() {
    const classes = useStyles();

    return (
        <div className={classes.container}>
           Anki coming soon(ish)
        </div>
    );
}

export default AnkiDashboard;