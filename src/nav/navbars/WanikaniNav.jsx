import React from "react";
import { RoutePaths } from '../../Routes';
import NavButton from "../components/NavButton";

function WanikaniNav() {
    return (
        <div>
            <NavButton text={'Dashboard'} route={RoutePaths.wanikaniDashboard} />
            <NavButton text={'History'} route={RoutePaths.wanikaniHistory} />
            <NavButton text={'Projections'} route={RoutePaths.wanikaniProjections} />
            <NavButton text={'Items'} route={RoutePaths.wanikaniItems} />
        </div>
    );
}

export default WanikaniNav;
