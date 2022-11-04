import React from "react";
import {RoutePaths} from '../../Routes';
import NavButton from "../components/NavButton";
import {GlobalLoadingIndicator} from "../components/GlobalLoadingIndicator";

function WanikaniNav() {
    return (
        <div style={{display: 'flex', marginRight: '10px'}}>
            <NavButton text={'Dashboard'} route={RoutePaths.wanikaniDashboard}/>
            <NavButton text={'History'} route={RoutePaths.wanikaniHistory}/>
            <NavButton text={'Items'} route={RoutePaths.wanikaniItems}/>

            <div style={{marginLeft: "auto", marginTop: '5px'}}>
                <GlobalLoadingIndicator/>
            </div>
        </div>
    );
}

export default WanikaniNav;
