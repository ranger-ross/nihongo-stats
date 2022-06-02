import {Button, Typography} from "@mui/material";
import {useNavigate} from "react-router";

const styles = {
    topTitle: {
        marginBottom: '50px'
    },
}

function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div style={{
            textAlign: 'center',
            marginTop: '15vh'
        }} >
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
