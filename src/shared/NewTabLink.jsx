import {Link} from "@mui/material";

function NewTabLink(props) {
    return (
        <Link {...props} target={'_blank'}>
            {props.children}
        </Link>
    );
}

export default NewTabLink;