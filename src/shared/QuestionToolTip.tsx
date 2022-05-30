import {Tooltip} from "@mui/material";
import {HelpOutline} from "@mui/icons-material";
import React from "react";

type Props = {
    size: 'large' | 'medium' | 'small',
    text: string,
};

function QuestionToolTip({size = 'small', text}: Props) {
    return (
        <Tooltip title={text}>
            <HelpOutline fontSize={size}/>
        </Tooltip>
    );
}


export default QuestionToolTip;
