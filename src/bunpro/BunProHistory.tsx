import {RoutePaths} from "../Routes";
import BunProPreloadedData from "./components/BunProPreloadedData";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import BunProReviewsHistoryChart from "./components/BunProReviewsHistoryChart";
import BunProTotalReviewsChart from "./components/BunProTotalReviewsChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import BunProTotalGrammarPointsChart from "./components/BunProTotalGrammarPointsChart";
import {useBunProData} from "../hooks/useBunProData";


function BunProHistory() {
    const {apiKey} = useBunProApiKey();

    const {grammarPoints, reviewData} = useBunProData({
        reviews: true,
        grammarPoints: true,
    })

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <BunProPreloadedData>
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
            </BunProPreloadedData>
        </RequireOrRedirect>
    );
}

export default BunProHistory;
