import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
});


function AboutPage() {
    const classes = useStyles();

    return (
        <div className={classes.container}>
           About Page coming soon(ish)
        </div>
    );
}

export default AboutPage;