import {useIsFetching} from "@tanstack/react-query";
import {CircularProgress, Tooltip} from "@mui/material";
import React from "react";

export function GlobalLoadingIndicator() {
    const isFetching = useIsFetching()
    return isFetching ? (
        <Tooltip title={"Reloading data in background"}>
            <CircularProgress size={20}/>
        </Tooltip>
    ) : null
}
