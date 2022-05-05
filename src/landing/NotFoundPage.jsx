import {Button, Typography} from "@mui/material";
import {useNavigate} from "react-router";

const styles = {
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    },
    topTitle: {
        marginBottom: '50px'
    },
}

function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div style={styles.container}>
            <Typography variant={'h4'} style={styles.topTitle}>
                Page Not Found :(
            </Typography>

            <Button
                size={'large'}
                onClick={() => navigate('/')}
            >
                Go back
            </Button>
        </div>
    );
}

export default NotFoundPage;
