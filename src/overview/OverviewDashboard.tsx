import OverviewWelcomeTile from "./components/OverviewWelcomeTile";
import OverviewUpcomingReviewsChart from "./components/OverviewUpcomingReviewsChart";
import {useDeviceInfo} from "../hooks/useDeviceInfo";
import WanikaniActiveItemsChart from "../wanikani/components/WanikaniActiveItemChart";
import BunProActiveItemsChart from "../bunpro/components/BunProActiveItemsChart";
import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import {AppStyles} from "../util/TypeUtils";
import {useWanikaniData} from "../hooks/useWanikaniData";
import {useBunProData} from "../hooks/useBunProData";

const styles: AppStyles = {
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

    const {user: wanikaniUser, assignments, subjects} = useWanikaniData({
        assignments: !!wanikaniApiKey,
        user: !!wanikaniApiKey,
        subjects: !!wanikaniApiKey,
    })

    const {user: bunProUser, grammarPoints, reviewData} = useBunProData({
        user: !!bunProApiKey,
        grammarPoints: !!bunProApiKey,
        reviews: !!bunProApiKey,
    });

    return (

        <div style={styles.container}>
            <div style={styles.innerContainer}>

                <div style={{...styles.leftPanel, minWidth: !isMobile ? '200px' : undefined}}>
                    <OverviewWelcomeTile/>
                </div>

                <div style={styles.rightPanel}>
                    <OverviewUpcomingReviewsChart/>
                </div>

            </div>

            <div style={styles.bottomPanel}>
                {wanikaniApiKey ? (
                    <WanikaniActiveItemsChart
                        showWanikaniHeader={true}
                        assignments={assignments}
                        subjects={subjects}
                        user={wanikaniUser}
                    />
                ) : null}
                {bunProApiKey ? (
                    <BunProActiveItemsChart
                        showBunProHeader={true}
                        user={bunProUser}
                        reviews={reviewData?.reviews}
                        grammarPoints={grammarPoints}
                    />
                ) : null}
            </div>

        </div>
    );
}

export default OverviewDashboard;
