import {Button, Collapse} from "@mui/material";
import {useState} from "react";
import {getErrorMessage, type FallbackProps} from "react-error-boundary";
import {APP_URLS} from "../Constants";
import NewTabLink from "./NewTabLink";

export function GenericErrorMessage({error}: FallbackProps) {
    const [open, setOpen] = useState(false);
    const message = getErrorMessage(error) ?? "Unknown error";
    return (
        <div role="alert">

            <p>Something went wrong</p>
            <pre>{message}</pre>

            <Button onClick={() => setOpen(!open)}>
                {open ? 'Hide Error' : 'Show Full Error'}
            </Button>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <pre>{error instanceof Error ? error.stack ?? message : message}</pre>
            </Collapse>

            <p>Try force refreshing, and if the issue persists please consider
                reporting this error in <NewTabLink href={APP_URLS.githubIssuesPage}>GitHub</NewTabLink></p>

        </div>
    )
}
