import BunProApiService from "./service/BunProApiService.js";
import {useEffect} from "react";

const styles = {
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    }
};

function BunProDashboard() {

    useEffect(() => {
        const apiKey = '';
        BunProApiService.getAllReviews(apiKey)
            .then(console.log)
            .catch(console.error);
    }, []);

    return (
        <div style={styles.container}>
            BunPro coming soon(ish)
        </div>
    );
}

export default BunProDashboard;