import {useEffect} from "react";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";
import AnkiDeckSummaries from "./components/AnkiDeckSummaries.jsx";
import AnkiCardBreakDownChart from "./components/AnkiCardBreakDownChart.jsx";

const styles = {
    container: {
        margin: '5px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },
    leftContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    rightContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
};

function AnkiDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        AnkiApiService.connect()
            .catch(() => navigate(RoutePaths.ankiConnect, {replace: true}));
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.leftContainer}>
                <AnkiDeckSummaries/>
                <AnkiCardBreakDownChart/>
            </div>
            <div style={styles.rightContainer}>
                placeholder right
            </div>

        </div>
    );
}

export default AnkiDashboard;