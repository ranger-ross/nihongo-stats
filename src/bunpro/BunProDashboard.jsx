import {useEffect} from "react";
import {Navigate} from "react-router";
import {RoutePaths} from "../Routes.jsx";
import {useBunProApiKey} from "../hooks/useBunProApiKey.jsx";
import {BunProWelcomeTile} from "./components/BunProWelcomeTile.jsx";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '10px',
        gap: '10px',
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
                <div style={styles.container}>

                    <BunProWelcomeTile/>


                </div>
            )}

        </div>
    );
}

export default BunProDashboard;