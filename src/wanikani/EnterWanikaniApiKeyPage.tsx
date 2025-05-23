import { Alert, Button, GridLegacy, Link, Snackbar, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useWanikaniApiKey } from "../hooks/useWanikaniApiKey";
import WanikaniApiService from "./service/WanikaniApiService";
import { useNavigate } from "react-router";
import { RoutePaths } from "../Routes";
import { AppStyles } from "../util/TypeUtils";


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

function EnterWanikaniApiKeyPage() {
    const navigate = useNavigate();
    const { setApiKey } = useWanikaniApiKey();
    const [textfieldValue, setTextfieldValue] = useState('');
    const [isFailure, setIsFailure] = useState(false);

    const verifyAndSetApiKey = (key: string) => {
        console.log(key);
        WanikaniApiService.login(key)
            .then(async (response) => {
                if (!response.ok)
                    throw new Error("Login failed");

                const user = await response.json();
                console.log('Wanikani user logged in', user);

                setApiKey(key);
                navigate(RoutePaths.wanikaniDashboard.path);
            })
            .catch(e => {
                console.error('Wanikani login error', e);
                setIsFailure(true);
            });
    };

    return (
        <GridLegacy container style={styles.container}
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={0}
        >
            <Snackbar
                open={isFailure}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                autoHideDuration={6000}
                onClose={() => setIsFailure(false)}
            >
                <Alert
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    Failed to login
                </Alert>
            </Snackbar>

            <GridLegacy item xs={12}>
                <Typography style={styles.text}>
                    Please enter your <Link href="https://www.wanikani.com/settings/personal_access_tokens"
                        target="_blank">Wanikani Api Key</Link>
                </Typography>
            </GridLegacy>

            <GridLegacy item xs={12} container alignItems="center" justifyContent="center" spacing={2}>
                <GridLegacy item>
                    <TextField label="Api Key"
                        variant={'outlined'}
                        value={textfieldValue}
                        onChange={e => setTextfieldValue(e.target.value)}
                        onKeyUp={e => e.key === 'Enter' && textfieldValue !== '' ? verifyAndSetApiKey(textfieldValue) : null}
                    />
                </GridLegacy>
                <GridLegacy item>
                    <Button variant={'contained'}
                        color={'primary'}
                        disabled={textfieldValue.length == 0}
                        onClick={() => verifyAndSetApiKey(textfieldValue)}
                    >
                        Go
                    </Button>
                </GridLegacy>

            </GridLegacy>
        </GridLegacy>
    );
}

export default EnterWanikaniApiKeyPage;
