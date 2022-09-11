import {RoutePaths} from "../Routes";
import {BunProLoadingScreen} from "./components/BunProPreloadedData";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import BunProReviewsHistoryChart from "./components/BunProReviewsHistoryChart";
import BunProTotalReviewsChart from "./components/BunProTotalReviewsChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import BunProTotalGrammarPointsChart from "./components/BunProTotalGrammarPointsChart";
import {useBunProData} from "../hooks/useBunProData";

function BunProHistoryContent() {
    const {grammarPoints, reviewData} = useBunProData({
        reviews: true,
        grammarPoints: true,
    })

    const isLoading = !grammarPoints || !reviewData;

    if (isLoading) {
        return (
            <BunProLoadingScreen
                config={{
                    reviews: true,
                    grammarPoints: true
                }}
                grammarPoints={grammarPoints}
                reviews={reviewData}
            />
        );
    }

    return (
        <div>

            <BunProReviewsHistoryChart
                reviews={reviewData?.reviews}
                grammarPoints={grammarPoints}
            />

            <BunProTotalReviewsChart
                reviews={reviewData?.reviews}
                grammarPoints={grammarPoints}
            />

            <BunProTotalGrammarPointsChart
                grammarPoints={grammarPoints}
                reviews={reviewData?.reviews}
            />

        </div>
    );
}

function BunProHistory() {
    const {apiKey} = useBunProApiKey();

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <BunProHistoryContent/>
        </RequireOrRedirect>
    );
}

export default BunProHistory;
