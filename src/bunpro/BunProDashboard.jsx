import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
});


function BunProDashboard() {
    const classes = useStyles();

    return (
        <div className={classes.container}>
           BunPro coming soon(ish)
        </div>
    );
}

export default BunProDashboard;