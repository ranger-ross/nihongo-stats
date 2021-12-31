import React from "react";
import { RoutePaths } from '../../Routes';
import NavButton from "../components/NavButton";

function BunProNav() {
    return (
        <div>
            <NavButton text={'Dashboard'} route={RoutePaths.bunproDashboard} />
            <NavButton text={'History'} route={RoutePaths.bunproHistory} />
        </div>
    );
}

export default BunProNav;