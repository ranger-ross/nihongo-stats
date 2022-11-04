import React from "react";
import {RoutePaths} from '../../Routes';
import NavButton from "../components/NavButton";
import AnkiDeckSelector from "../components/AnkiDeckSelector";
import {GlobalLoadingIndicator} from "../components/GlobalLoadingIndicator";

function AnkiNav() {
    return (
        <div style={{display: 'flex', marginRight: '10px'}}>
            <NavButton text={'Dashboard'} route={RoutePaths.ankiDashboard}/>
            <NavButton text={'History'} route={RoutePaths.ankiHistory}/>
            <AnkiDeckSelector/>

            <div style={{marginLeft: "auto", marginTop: '10px'}}>
                <GlobalLoadingIndicator/>
            </div>
        </div>
    );
}

export default AnkiNav;
