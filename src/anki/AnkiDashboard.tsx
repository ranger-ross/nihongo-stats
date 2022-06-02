import AnkiDeckSummariesTile from "./components/AnkiDeckSummariesTile";
import AnkiCardBreakDownChart from "./components/AnkiCardBreakDownChart";
import AnkiApiProvider from "./components/AnkiApiProvider";
import AnkiUpcomingReviewsChart from "./components/AnkiUpcomingReviewsChart";
import {AppStyles} from "../util/TypeUtils";

const styles: AppStyles = {
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
