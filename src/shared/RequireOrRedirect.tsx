import {Navigate} from "react-router";
import React from "react";


type Props = {
    resource: any,
    redirectPath: string,
    children: React.ReactNode
};

function RequireOrRedirect({children, resource, redirectPath}: Props) {
    return !!resource ? <>{children}</> : (<Navigate to={redirectPath} replace={true}/>);
}

export default RequireOrRedirect;
