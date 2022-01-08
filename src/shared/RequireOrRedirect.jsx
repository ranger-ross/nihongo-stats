import {Navigate} from "react-router";

function RequireOrRedirect({children, resource, redirectPath}) {
    return !!resource ? children : (<Navigate to={redirectPath} replace={true}/>);
}

export default RequireOrRedirect;