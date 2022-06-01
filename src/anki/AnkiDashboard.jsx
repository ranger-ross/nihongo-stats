import AnkiDeckSummariesTile from "./components/AnkiDeckSummariesTile.tsx";
import AnkiCardBreakDownChart from "./components/AnkiCardBreakDownChart.tsx";
import AnkiApiProvider from "./components/AnkiApiProvider.tsx";
import AnkiUpcomingReviewsChart from "./components/AnkiUpcomingReviewsChart.tsx";

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
        minWidth: '425px',
    },
    rightContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flexGrow: '1',
    },
};

function AnkiDashboard() {
    return (
        <AnkiApiProvider>
            <div style={styles.container}>
                <div style={styles.leftContainer}>
                    <AnkiDeckSummariesTile/>
                    <AnkiCardBreakDownChart/>
                </div>
                <div style={styles.rightContainer}>
                    <AnkiUpcomingReviewsChart/>
                </div>
            </div>
        </AnkiApiProvider>
    );
}

export default AnkiDashboard;
