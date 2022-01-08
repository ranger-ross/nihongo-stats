import {RoutePaths} from "../Routes";
import {Card, CardContent} from "@mui/material";
import BunProPreloadedData from "./components/BunProPreloadedData.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";
import BunProReviewsHistoryChart from "./components/BunProReviewsHistoryChart.jsx";
import BunProTotalReviewsChart from "./components/BunProTotalReviewsChart.jsx";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";


function BunProHistory() {
    const {apiKey} = useBunProApiKey();

    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.bunproLogin.path}
        >
            <BunProPreloadedData>
                <div>

                    <Card variant={'outlined'} style={{margin: '15px'}}>
                        <CardContent>
                            <BunProReviewsHistoryChart/>
                        </CardContent>
                    </Card>

                    <Card variant={'outlined'} style={{margin: '15px'}}>
                        <CardContent>
                            <BunProTotalReviewsChart/>
                        </CardContent>
                    </Card>


                </div>
            </BunProPreloadedData>
        </RequireOrRedirect>
    );
}

export default BunProHistory;