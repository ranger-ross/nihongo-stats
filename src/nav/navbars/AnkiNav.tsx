import React from "react";
// @ts-ignore
import {RoutePaths} from '../../Routes';
import NavButton from "../components/NavButton";
import AnkiDeckSelector from "../components/AnkiDeckSelector";

function AnkiNav() {
    return (
        <div>
            <NavButton text={'Dashboard'} route={RoutePaths.ankiDashboard}/>
            <NavButton text={'History'} route={RoutePaths.ankiHistory}/>
            <AnkiDeckSelector/>
        </div>
    );
}

export default AnkiNav;
