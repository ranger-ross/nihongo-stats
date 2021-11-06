import makeStyles from "@material-ui/core/styles/makeStyles";
import EnterWanikaniApiKeyPage from "./EnterWanikaniApiKeyPage";
import { useWanikaniApiKey } from "./service/WanikaniApiKeyService";

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
                <div>
                   wanikani {apiKey}
                </div>
            )}


        </div>
    );
}

export default Wanikani;