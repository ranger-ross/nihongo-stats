import BunProApiService from "./service/BunProApiService.js";
import {useEffect} from "react";
import {Navigate} from "react-router";
import {RoutePaths} from "../Routes.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";

const styles = {
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
};

function BunProDashboard() {

    const {apiKey} = useBunProApiKey();

    useEffect(() => {
        // BunProApiService.login(apiKey)
        //     .then(console.log)
        //     .catch(console.error);
    }, []);

    return (
        <div style={styles.container}>
            {!apiKey ? (<Navigate to={RoutePaths.bunproLogin} replace={true}/>) : (
                <div>
                    BunPro coming soon(ish)
                </div>
            )}

        </div>
    );
}

export default BunProDashboard;