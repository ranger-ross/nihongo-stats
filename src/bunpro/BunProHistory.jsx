import {RoutePaths} from "../Routes";
import BunProPreloadedData from "./components/BunProPreloadedData.tsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.tsx";
import BunProReviewsHistoryChart from "./components/BunProReviewsHistoryChart.tsx";
import BunProTotalReviewsChart from "./components/BunProTotalReviewsChart.jsx";
import RequireOrRedirect from "../shared/RequireOrRedirect.tsx";
import BunProTotalGrammarPointsChart from "./components/BunProTotalGrammarPointsChart.tsx";


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
