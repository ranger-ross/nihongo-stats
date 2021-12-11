import WanikaniLevelItemsChart from "./WanikaniLevelItemsChart";
import WanikaniApiService from "../service/WanikaniApiService";
import { useState, useEffect } from "react";

function WanikaniActiveItemsChart() {
    const [user, setUser] = useState();
    useEffect(() => {
        let isSubscribed = true;

        WanikaniApiService.getUser()
            .then(data => {
                if (!isSubscribed)
                    return;
                setUser(data);
            })
        return () => isSubscribed = false;
    }, [])
    return (
        <>
            {!!user ? <WanikaniLevelItemsChart level={user.data.level} showPreviousLevelSelector={true} /> : null}
        </>
    )
}

export default WanikaniActiveItemsChart;