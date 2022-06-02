// @ts-ignore
import {RoutePaths} from "../Routes.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import {BunProWelcomeTile} from "./components/BunProWelcomeTile";
import BunProPreloadedData from "./components/BunProPreloadedData";
import {BunProJLPTTile} from "./components/BunProJLPTTile";
import BunProUpcomingReviewsChart from "./components/BunProUpcomingReviewsChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import {useDeviceInfo} from "../hooks/useDeviceInfo";
import BunProActiveItemsChart from "./components/BunProActiveItemsChart";
import {AppStyles} from "../util/TypeUtils";

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
};

function BunProDashboard() {
    const {apiKey} = useBunProApiKey();
    const {isMobile} = useDeviceInfo();

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <div style={styles.container}>
                <BunProPreloadedData>
                    <div style={styles.container}>

                        <div style={styles.innerContainer}>

                            <div style={{...styles.leftPanel, minWidth: !isMobile ? '500px' : undefined}}>
                                <BunProWelcomeTile/>

                                <BunProJLPTTile showXpProgress={true}/>
                            </div>

                            <div style={styles.rightPanel}>
                                <BunProUpcomingReviewsChart/>
                            </div>

                        </div>

                        <div>
                            <BunProActiveItemsChart/>
                        </div>
                    </div>
                </BunProPreloadedData>
            </div>
        </RequireOrRedirect>

    );
}

export default BunProDashboard;
