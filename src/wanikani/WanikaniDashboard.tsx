import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import {RoutePaths} from "../Routes";
import WanikaniLevelSummaryChart from "./components/WanikaniLevelSummaryChart";
import WanikaniUpcomingReviewsChart from "./components/WanikaniUpcomingReviewsChart";
import WanikaniWelcomeTile from "./components/WanikaniWelcomeTile";
import WanikaniItemCountsChart from "./components/WanikaniItemCountsChart";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import WanikaniActiveItemsChart from "./components/WanikaniActiveItemChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import {AppStyles} from "../util/TypeUtils";
import {useEffect, useState} from "react";
import WanikaniApiService from "./service/WanikaniApiService";
import {WanikaniUser} from "./models/WanikaniUser";
import {WanikaniSubject} from "./models/WanikaniSubject";
import {WanikaniLevelProgression} from "./models/WanikaniLevelProgress";
import {WanikaniAssignment} from "./models/WanikaniAssignment";

const styles: AppStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
    topContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'stretch'
    },
    leftContainer: {
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
        flexGrow: '1'
    },
    rightContainer: {
        flexGrow: '25'
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
};


function DashboardContent() {

    const [user, setUser] = useState<WanikaniUser>();
    const [subjects, setSubjects] = useState<WanikaniSubject[]>([]);
    const [levelProgress, setLevelProgress] = useState<WanikaniLevelProgression[]>([]);
    const [assignments, setAssignments] = useState<WanikaniAssignment[]>([]);
    const [pendingTasks, setPendingTasks] = useState<{ lessons: number, reviews: number }>({reviews: 0, lessons: 0});

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

        WanikaniApiService.getLevelProgress()
            .then(data => {
                if (!isSubscribed)
                    return;
                setLevelProgress(data);
            });

        WanikaniApiService.getAllAssignments()
            .then(data => {
                if (!isSubscribed)
                    return;
                setAssignments(data);
            });

        WanikaniApiService.getPendingLessonsAndReviews()
            .then(data => {
                if (!isSubscribed)
                    return;
                setPendingTasks(data);
            });

        return () => {
            isSubscribed = false;
        };
    }, []);

    return (
        <>
            <div style={styles.container}>
                <div style={styles.topContainer}>
                    <div style={styles.leftContainer}>
                        <WanikaniWelcomeTile
                            user={user}
                            pendingLessons={pendingTasks.lessons}
                            pendingReviews={pendingTasks.reviews}
                        />

                        <WanikaniLevelSummaryChart
                            levelsProgress={levelProgress}
                            user={user}
                            subjects={subjects}
                            assignments={assignments}
                        />

                        <WanikaniItemCountsChart assignments={assignments}/>
                    </div>

                    <div style={styles.rightContainer}>
                        <WanikaniUpcomingReviewsChart
                            assignments={assignments}
                            pendingReviewCount={pendingTasks.lessons}
                        />
                    </div>
                </div>
            </div>

            <div style={styles.bottomContainer}>
                <WanikaniActiveItemsChart
                    subjects={subjects}
                    assignments={assignments}
                    user={user}
                />
            </div>
        </>
    );
}

function WanikaniDashboard() {
    const {apiKey} = useWanikaniApiKey();
    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <WanikaniPreloadedData>
                <DashboardContent/>
            </WanikaniPreloadedData>
        </RequireOrRedirect>
    );
}

export default WanikaniDashboard;
