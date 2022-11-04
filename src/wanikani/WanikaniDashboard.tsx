import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey";
import {RoutePaths} from "../Routes";
import WanikaniLevelSummaryChart from "./components/WanikaniLevelSummaryChart";
import WanikaniUpcomingReviewsChart from "./components/WanikaniUpcomingReviewsChart";
import WanikaniWelcomeTile from "./components/WanikaniWelcomeTile";
import WanikaniItemCountsChart from "./components/WanikaniItemCountsChart";
import WanikaniActiveItemsChart from "./components/WanikaniActiveItemChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import {AppStyles} from "../util/TypeUtils";
import WanikaniLoadingScreen from "./components/WanikaniLoadingScreen";
import {useWanikaniData} from "../hooks/useWanikaniData";

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
    const {user, levelProgress, summary, subjects, assignments, isLoading} = useWanikaniData({
        user: true,
        subjects: true,
        assignments: true,
        summary: true,
        levelProgress: true,
    });

    if (isLoading) {
        return (
            <WanikaniLoadingScreen
                fetch={{
                    user: true,
                    assignments: true,
                    summary: true,
                    subjects: true,
                }}
                isLoaded={{
                    user: !!user,
                    assignments: assignments.length > 0,
                    subjects: subjects.length > 0,
                    summary: !!summary,
                }}
            />
        );
    }

    return (
        <>
            <div style={styles.container}>
                <div style={styles.topContainer}>
                    <div style={styles.leftContainer}>
                        <WanikaniWelcomeTile
                            user={user}
                            summary={summary}
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
                            summary={summary}
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
            <DashboardContent/>
        </RequireOrRedirect>
    );
}

export default WanikaniDashboard;
