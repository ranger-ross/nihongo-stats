import {Tooltip} from "@mui/material";
import {HelpOutline} from "@mui/icons-material";
import React from "react";

function QuestionToolTip({size = 'small', text}) {
    return (
        <Tooltip title={text}>
            <HelpOutline fontSize={size}/>
        </Tooltip>
    );
}


export default QuestionToolTip;
