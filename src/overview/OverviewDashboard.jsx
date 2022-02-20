import OverviewWelcomeTile from "./components/OverviewWelcomeTile.jsx";
import OverviewUpcomingReviewsChart from "./components/OverviewUpcomingReviewsChart.jsx";
import {useDeviceInfo} from "../hooks/useDeviceInfo.jsx";

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
    },
    rightPanel: {
        flexGrow: '25'
    },
};

function OverviewDashboard() {
    const {isMobile} = useDeviceInfo();

    return (

        <div style={styles.container}>
            <div style={styles.innerContainer}>

                <div style={{...styles.leftPanel, minWidth: !isMobile ? '500px' : null}}>
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
