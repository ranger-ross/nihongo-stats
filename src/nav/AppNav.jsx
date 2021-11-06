import { Grid } from "@material-ui/core";
import { useGlobalState } from "../GlobalState";
import AppSelector from "./AppSelector";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
    container: {
        padding: '5px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
    },
    selectorContainer: {
        width: '120px',
        marginLeft: '5px',
    }
});


function AppNav() {
    const { selectedApp, setSelectedApp } = useGlobalState();
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <div className={classes.selectorContainer}>
                <AppSelector selectedApp={selectedApp} setSelectedApp={setSelectedApp} />

            </div>
        </div>
    );
}

export default AppNav;