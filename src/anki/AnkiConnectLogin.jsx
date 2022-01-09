import {Box, Button, Container, Link} from "@mui/material";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";
import {useState} from "react";
import AnkiHowToInstall from "./components/AnkiHowToInstall.jsx";

const styles = {
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
};

function AnkiConnectLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    function connectToAnki() {
        AnkiApiService.requestPermission()
            .then((data) => {
                console.log(data);
                if (data?.permission === 'granted') {
                    navigate(RoutePaths.ankiDashboard.path, {replace: true});
                } else {
                    setError('Permission to Anki was Denied');
                }
            })
            .catch(() => setError('Failed to connect to Anki'));
    }

    return (
        <div style={styles.container}>
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

            {!!error ? (
                <div style={{color: 'red'}}>
                    {error}
                </div>
            ) : null}

            <Container>
                <AnkiHowToInstall onConnect={connectToAnki}/>
            </Container>


        </div>
    );
}

export default AnkiConnectLogin;