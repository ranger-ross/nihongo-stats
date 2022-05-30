import {RoutePaths} from "../Routes";
import BunProPreloadedData from "./components/BunProPreloadedData.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";
import BunProReviewsHistoryChart from "./components/BunProReviewsHistoryChart.jsx";
import BunProTotalReviewsChart from "./components/BunProTotalReviewsChart.jsx";
import RequireOrRedirect from "../shared/RequireOrRedirect.tsx";
import BunProTotalGrammarPointsChart from "./components/BunProTotalGrammarPointsChart.jsx";


function BunProHistory() {
    const {apiKey} = useBunProApiKey();

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <BunProPreloadedData>
                <div>

                    <BunProReviewsHistoryChart/>

                    <BunProTotalReviewsChart/>

                    <BunProTotalGrammarPointsChart/>

                </div>
            </BunProPreloadedData>
        </RequireOrRedirect>
    );
}

export default BunProHistory;
