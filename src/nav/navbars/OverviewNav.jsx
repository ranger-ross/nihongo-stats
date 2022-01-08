import React from "react";
import {RoutePaths} from '../../Routes';
import NavButton from "../components/NavButton";

function OverviewNav() {
    return (
        <div>
            <NavButton text={'Dashboard'} route={RoutePaths.overviewDashboard}/>
            <NavButton text={'History'} route={RoutePaths.overviewHistory}/>
        </div>
    );
}

export default OverviewNav;