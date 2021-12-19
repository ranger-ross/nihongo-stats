import React from "react";
import { RoutePaths } from '../../Routes';
import NavButton from "../components/NavButton";

function AnkiNav() {
    return (
        <div>
            <NavButton text={'Dashboard'} route={RoutePaths.ankiDashboard} />
            <NavButton text={'History'} route={RoutePaths.ankiHistory} />
        </div>
    );
}

export default AnkiNav;