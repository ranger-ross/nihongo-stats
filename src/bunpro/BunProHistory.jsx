import {Navigate} from "react-router";
import {RoutePaths} from "../Routes";
import {Card, CardContent} from "@mui/material";
import BunProPreloadedData from "./components/BunProPreloadedData.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";
import BunProReviewsHistoryChart from "./components/BunProReviewsHistoryChart.jsx";
import BunProTotalReviewsChart from "./components/BunProTotalReviewsChart.jsx";


function BunProHistory() {
    const {apiKey} = useBunProApiKey();

    return (
        <>
            {!apiKey ? (<Navigate to={RoutePaths.bunproLogin} replace={true}/>) : (
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
            )}
        </>
    );
}

export default BunProHistory;