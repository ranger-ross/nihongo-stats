import OverviewWelcomeTile from "./components/OverviewWelcomeTile";
import OverviewUpcomingReviewsChart from "./components/OverviewUpcomingReviewsChart";
import {useDeviceInfo} from "../hooks/useDeviceInfo";
import WanikaniActiveItemsChart from "../wanikani/components/WanikaniActiveItemChart";
import BunProActiveItemsChart from "../bunpro/components/BunProActiveItemsChart";
import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import {AppStyles} from "../util/TypeUtils";
import {useEffect, useState} from "react";
import {WanikaniUser} from "../wanikani/models/WanikaniUser";
import {WanikaniSubject} from "../wanikani/models/WanikaniSubject";
import {WanikaniAssignment} from "../wanikani/models/WanikaniAssignment";
import WanikaniApiService from "../wanikani/service/WanikaniApiService";

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

    const [user, setUser] = useState<WanikaniUser>();
    const [subjects, setSubjects] = useState<WanikaniSubject[]>([]);
    const [assignments, setAssignments] = useState<WanikaniAssignment[]>([]);

    useEffect(() => {
        let isSubscribed = true;

        WanikaniApiService.getUser()
            .then(data => {
                if (!isSubscribed)
                    return;
                setUser(data);
            });

        WanikaniApiService.getSubjects()
            .then(data => {
                if (!isSubscribed)
                    return;
                setSubjects(data);
            });

        WanikaniApiService.getAllAssignments()
            .then(data => {
                if (!isSubscribed)
                    return;
                setAssignments(data);
            });

        return () => {
            isSubscribed = false;
        };
    }, []);

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
                        user={user}
                    />
                ) : null}
                {bunProApiKey ? (
                    <BunProActiveItemsChart showBunProHeader={true}/>
                ) : null}
            </div>

        </div>
    );
}

export default OverviewDashboard;
