import {Alert, Button, Grid, Link, Snackbar, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";
import BunProApiService from "./service/BunProApiService";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import {AppStyles} from "../util/TypeUtils";
import { BunProAPINotice } from "./components/BunProAPINotice";


const styles: AppStyles = {
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
    const [isFailure, setIsFailure] = useState(false);

    const verifyAndSetApiKey = (key: string) => {
        BunProApiService.login(key)
            .then(user => {
                console.log('Logged in to BunPro', user);
                setApiKey(key);
                navigate(RoutePaths.bunproDashboard.path);
            })
            .catch(e => {
                console.error('BunPro login error', e);
                setIsFailure(true);
            });
    };

    return (
        <Grid container style={styles.container}
              direction="column"
              alignItems="center"
              justifyContent="center"
              spacing={0}
        >
            <Snackbar
                open={isFailure}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                autoHideDuration={6000}
                onClose={() => setIsFailure(false)}
            >
                <Alert
                    severity="error"
                    sx={{width: '100%'}}
                >
                    Failed to login
                </Alert>
            </Snackbar>

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
                               // Disabled input 
                               disabled={true}
                               value={textfieldValue}
                               onChange={e => setTextfieldValue(e.target.value)}
                               onKeyUp={e => e.key === 'Enter' && textfieldValue !== '' ? verifyAndSetApiKey(textfieldValue) : null}
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
            
            <BunProAPINotice />

        </Grid>
    );
}

export default EnterBunProApiKeyPage;
