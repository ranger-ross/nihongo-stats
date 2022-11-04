import React from "react";
import {RoutePaths} from '../../Routes';
import NavButton from "../components/NavButton";
import {GlobalLoadingIndicator} from "../components/GlobalLoadingIndicator";

function BunProNav() {
    return (
        <div style={{display: 'flex', marginRight: '10px'}}>
            <NavButton text={'Dashboard'} route={RoutePaths.bunproDashboard}/>
            <NavButton text={'History'} route={RoutePaths.bunproHistory}/>

            <div style={{marginLeft: "auto", marginTop: '5px'}}>
                <GlobalLoadingIndicator/>
            </div>
        </div>
    );
}

export default BunProNav;
