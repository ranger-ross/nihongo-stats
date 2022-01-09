import {Button, Grid, Link, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";
import BunProApiService from "./service/BunProApiService.js";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";


const styles = {
    container: {
        minHeight: '70vh'
    },
    text: {
        margin: '10px',
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: '10px'
    }
};

function EnterBunProApiKeyPage() {
    const navigate = useNavigate();
    const {setApiKey} = useBunProApiKey();
    const [textfieldValue, setTextfieldValue] = useState('');

    const verifyAndSetApiKey = (key) => {
        BunProApiService.login(key)
            .then(user => {
                console.log('Logged in to BunPro', user);
                setApiKey(key);
                navigate(RoutePaths.bunproDashboard.path);
            })
            .catch(console.error);
    };

    return (
        <Grid container style={styles.container}
              direction="column"
              alignItems="center"
              justifyContent="center"
              spacing={0}
        >
            <Grid item xs={12}>
                <Typography style={styles.text}>
                    Please enter your <Link href="https://www.bunpro.jp/settings/api"
                                            target="_blank">BunPro Api Key</Link>
                </Typography>
            </Grid>

            <Grid item xs={12} container alignItems="center" justifyContent="center" spacing={2}>
                <Grid item>
                    <TextField label="Api Key"
                               variant={'outlined'}
                               value={textfieldValue}
                               onChange={e => setTextfieldValue(e.target.value)}
                    />
                </Grid>
                <Grid item>
                    <Button variant={'contained'}
                            color={'primary'}
                            disabled={textfieldValue.length == 0}
                            onClick={() => verifyAndSetApiKey(textfieldValue)}
                    >
                        Go
                    </Button>
                </Grid>

            </Grid>
        </Grid>
    );
}

export default EnterBunProApiKeyPage;