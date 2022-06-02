import OverviewWelcomeTile from "./components/OverviewWelcomeTile.tsx";
import OverviewUpcomingReviewsChart from "./components/OverviewUpcomingReviewsChart.jsx";
import {useDeviceInfo} from "../hooks/useDeviceInfo.tsx";
import WanikaniActiveItemsChart from "../wanikani/components/WanikaniActiveItemChart.tsx";
import BunProActiveItemsChart from "../bunpro/components/BunProActiveItemsChart.tsx";
import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.tsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.tsx";

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
    bottomPanel: {
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: '1fr',
        gap: '10px'
    }
};

function OverviewDashboard() {
    const {apiKey: wanikaniApiKey} = useWanikaniApiKey();
    const {apiKey: bunProApiKey} = useBunProApiKey();
    const {isMobile} = useDeviceInfo();

    return (

        <div style={styles.container}>
            <div style={styles.innerContainer}>

                <div style={{...styles.leftPanel, minWidth: !isMobile ? '200px' : null}}>
                    <OverviewWelcomeTile/>
                </div>

                <div style={styles.rightPanel}>
                    <OverviewUpcomingReviewsChart/>
                </div>

            </div>

            <div style={styles.bottomPanel}>
                {wanikaniApiKey ? (
                    <WanikaniActiveItemsChart showWanikaniHeader={true}/>
                ) : null}
                {bunProApiKey ? (
                    <BunProActiveItemsChart showBunProHeader={true}/>
                ) : null}
            </div>

        </div>
    );
}

export default OverviewDashboard;
