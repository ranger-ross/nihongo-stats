import {Button, Collapse} from "@mui/material";
import {useState} from "react";
import {APP_URLS} from "../Constants";
import NewTabLink from "./NewTabLink";


type GenericErrorMessageProps = {
    error: Error
    resetErrorBoundary?: Function
}

export function GenericErrorMessage({error}: GenericErrorMessageProps) {
    const [open, setOpen] = useState(false);
    return (
        <div role="alert">

            <p>Something went wrong</p>
            <pre>{error.message}</pre>

            <Button onClick={() => setOpen(!open)}>
                {open ? 'Hide Error' : 'Show Full Error'}
            </Button>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <pre>{error?.stack}</pre>
            </Collapse>

            <p>Try force refreshing, and if the issue persists please consider
                reporting this error in <NewTabLink href={APP_URLS.githubIssuesPage}>GitHub</NewTabLink></p>

        </div>
    )
}
