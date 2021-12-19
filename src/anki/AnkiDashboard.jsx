import {useEffect} from "react";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";

const styles = {
    container: {
        margin: '5px',
        display: 'flex',
        gap: '10px',
        flexDirection: 'column'
    }
};

function AnkiDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        AnkiApiService.connect()
            .catch(() => navigate(RoutePaths.ankiConnect, {replace: true}));
    }, []);

    return (
        <div style={styles.container}>
            Anki Dashboard
        </div>
    );
}

export default AnkiDashboard;