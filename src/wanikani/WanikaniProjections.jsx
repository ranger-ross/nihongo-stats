import {useWanikaniApiKey} from "../hooks/useWanikaniApiKey.jsx";
import {RoutePaths} from "../Routes";
import WanikaniPreloadedData from "./components/WanikaniPreloadedData";
import RequireOrRedirect from "../shared/RequireOrRedirect.jsx";
import WanikaniLevelProjectionsTable from "./components/WanikaniLevelProjectionsTable.jsx";
import {Card, CardContent} from "@mui/material";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
    },
};

function WanikaniProjections() {
    const {apiKey} = useWanikaniApiKey();
    return (
        <RequireOrRedirect resource={apiKey}
                           redirectPath={RoutePaths.wanikaniLogin.path}
        >
            <WanikaniPreloadedData>
                <div style={styles.container}>
                    <Card>
                        <CardContent>
                            <WanikaniLevelProjectionsTable/>
                        </CardContent>
                    </Card>
                </div>
            </WanikaniPreloadedData>
        </RequireOrRedirect>
    );
}

export default WanikaniProjections;
