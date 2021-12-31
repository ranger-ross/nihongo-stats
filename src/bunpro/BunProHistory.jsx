import {Navigate} from "react-router";
import {RoutePaths} from "../Routes";
import {Card} from "@mui/material";
import BunProPreloadedData from "./components/BunProPreloadedData.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";


function BunProHistory() {
    const {apiKey} = useBunProApiKey();

    return (
        <>
            {!apiKey ? (<Navigate to={RoutePaths.bunproLogin} replace={true}/>) : (
                <BunProPreloadedData>
                    <div>

                        <Card variant={'outlined'} style={{margin: '15px'}}>
                            placeholder
                        </Card>

                    </div>
                </BunProPreloadedData>
            )}
        </>
    );
}

export default BunProHistory;