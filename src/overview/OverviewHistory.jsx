import OverviewReviewsHistoryChart from "./components/OverviewReviewHistoryChart.jsx";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
};

function OverviewHistory() {

    return (
        <div style={styles.container}>

            <OverviewReviewsHistoryChart/>


        </div>
    );
}

export default OverviewHistory;
