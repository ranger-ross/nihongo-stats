import { useEffect, useState } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { CircularProgress } from "@material-ui/core";

function WanikaniPreloadedData({ children }) {
    const [isLoaded, setIsLoaded] = useState(window.isWanikaniPreloaded);

    useEffect(() => {
        if (isLoaded) {
            return;
        }
        console.log('Preloading Wanikani Data');
        Promise.all([
            WanikaniApiService.getSubjects(),
            WanikaniApiService.getUser(),
            WanikaniApiService.getAllAssignments()
        ])
            .then(() => {
                console.log('Wanikani Data preloaded');
                window.isWanikaniPreloaded = true;
                setIsLoaded(true);
            });
    }, []);

    return (
        <>
            {isLoaded ? (
                children
            ) : (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20%'}}>
                    <CircularProgress />
                </div>
            )}
        </>
    );
}

export default WanikaniPreloadedData;