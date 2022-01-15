import OverviewWelcomeTile from "./components/OverviewWelcomeTile.jsx";
import OverviewUpcomingReviewsChart from "./components/OverviewUpcomingReviewsChart.jsx";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
    innerContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'stretch'
    },
    leftPanel: {
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
        flexGrow: '1',
        minWidth: '500px'
    },
    rightPanel: {
        flexGrow: '25'
    },
};

function OverviewDashboard() {
    return (

        <div style={styles.container}>
            <div style={styles.innerContainer}>

                <div style={styles.leftPanel}>
                    <OverviewWelcomeTile/>
                </div>

                <div style={styles.rightPanel}>
                    <OverviewUpcomingReviewsChart/>
                </div>

            </div>

        </div>
    );
}

export default OverviewDashboard;
