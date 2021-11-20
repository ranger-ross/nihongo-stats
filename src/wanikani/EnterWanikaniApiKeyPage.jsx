import { Button, Grid, Link, TextField, Typography } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useState } from "react";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import WanikaniApiService from "./service/WanikaniApiService";
import { useNavigate } from "react-router";
import { RoutePaths } from "../Routes";


const useStyles = makeStyles({
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
});

function EnterWanikaniApiKeyPage() {
    const classes = useStyles();
    const navigate = useNavigate();
    const { setApiKey } = useWanikaniApiKey();
    const [textfieldValue, setTextfieldValue] = useState('');

    const verifyAndSetApiKey = (key) => {
        console.log(key);
        WanikaniApiService.getUser(key)
            .then(user => {
                console.log(user)
                setApiKey(key);
                navigate(RoutePaths.wanikaniDashboard);
            })
            .catch(console.error);
    };

    return (
        <Grid container className={classes.container}
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={0}
        >
            <Grid item xs={12}>
                <Typography className={classes.text} >
                    Please enter your <Link href="https://www.wanikani.com/settings/personal_access_tokens">Wanikani Api Key</Link>
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