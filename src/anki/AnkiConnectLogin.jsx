import makeStyles from "@material-ui/core/styles/makeStyles";
import {Button, Link} from "@material-ui/core";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";
import {useState} from "react";

const useStyles = makeStyles({
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
});

function AnkiConnectLogin() {
    const classes = useStyles();
    const navigate = useNavigate();
    const [showError, setShowError] = useState(false);


    function connectToAnki() {
        AnkiApiService.connect()
            .then(() => navigate(RoutePaths.ankiDashboard, {replace: true}))
            .catch(() => setShowError(true))
    }

    return (
        <div className={classes.container}>
            Can't connect to Anki. <br/>
            Please make sure you have <Link
            href={'https://ankiweb.net/shared/info/2055492159'}
            target={'_blank'}>Anki Connect</Link> installed and Anki open.

            <br/>
            <br/>

            <Button variant={'contained'}
                    color={'primary'}
                    onClick={connectToAnki}
            >
                Connect
            </Button>

            <br/>
            <br/>

            {showError ? (
                <div style={{color: 'red'}}>
                    Failed to connect to Anki
                </div>
            ) : null}

        </div>
    );
}

export default AnkiConnectLogin;