import {Link, LinkProps} from "@mui/material";

function NewTabLink(props: LinkProps) {
    return (
        <Link {...props} target={'_blank'}>
            {props.children}
        </Link>
    );
}

export default NewTabLink;
