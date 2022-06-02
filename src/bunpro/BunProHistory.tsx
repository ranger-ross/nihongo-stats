// @ts-ignore
import {RoutePaths} from "../Routes";
import BunProPreloadedData from "./components/BunProPreloadedData";
import {useBunProApiKey} from "../hooks/useBunProApiKey";
import BunProReviewsHistoryChart from "./components/BunProReviewsHistoryChart";
import BunProTotalReviewsChart from "./components/BunProTotalReviewsChart";
import RequireOrRedirect from "../shared/RequireOrRedirect";
import BunProTotalGrammarPointsChart from "./components/BunProTotalGrammarPointsChart";


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
