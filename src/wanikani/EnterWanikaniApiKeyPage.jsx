import {Button, Grid, Link, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import WanikaniApiService from "./service/WanikaniApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";


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

function EnterWanikaniApiKeyPage() {
    const navigate = useNavigate();
    const {setApiKey} = useWanikaniApiKey();
    const [textfieldValue, setTextfieldValue] = useState('');

    const verifyAndSetApiKey = (key) => {
        console.log(key);
        WanikaniApiService.login(key)
            .then(user => {
                console.log(user)
                setApiKey(key);
                navigate(RoutePaths.wanikaniDashboard.path);
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
                    Please enter your <Link href="https://www.wanikani.com/settings/personal_access_tokens"
                                            target="_blank">Wanikani Api Key</Link>
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

export default EnterWanikaniApiKeyPage;