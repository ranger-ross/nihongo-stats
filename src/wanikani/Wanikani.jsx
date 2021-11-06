import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
    container: {}
});


function Wanikani() {
    const classes = useStyles();

    return (
        <div className={classes.container}>
           wanikani
           
        </div>
    );
}

export default Wanikani;