import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
    container: {

    }
});


function BunPro() {
    const classes = useStyles();

    return (
        <div className={classes.container}>
           BunPro coming soon
        </div>
    );
}

export default BunPro;