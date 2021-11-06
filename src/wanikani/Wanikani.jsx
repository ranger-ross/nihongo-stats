import makeStyles from "@material-ui/core/styles/makeStyles";
import EnterWanikaniApiKeyPage from "./EnterWanikaniApiKeyPage";
import WanikaniDashboard from "./WanikaniDashboard";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";

const useStyles = makeStyles({
    container: {}
});


function Wanikani() {
    const classes = useStyles();

    const { apiKey } = useWanikaniApiKey();

    return (
        <div className={classes.container}>

            {!apiKey ? (
                <EnterWanikaniApiKeyPage />
            ) : (
                <WanikaniDashboard/>
            )}

        </div>
    );
}

export default Wanikani;