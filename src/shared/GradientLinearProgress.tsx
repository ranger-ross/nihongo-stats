import {styled} from "@mui/material/styles";
import {LinearProgress, linearProgressClasses, LinearProgressProps} from "@mui/material";
import {useMemo} from "react";

type Props = {
    lineStartColor: string,
    lineEndColor: string,
    backgroundLineColor: string,
} & LinearProgressProps;

function GradientLinearProgress({lineStartColor, lineEndColor, backgroundLineColor, ...otherProps}: Props) {
    const GradientLinearProgressInner = useMemo(() => styled(LinearProgress)(() => {
        return {
            [`&.${linearProgressClasses.root}`]: {
                backgroundColor: backgroundLineColor,
            },
            [`& .${linearProgressClasses.bar}`]: {
                borderRadius: 5,
                background: `linear-gradient(to right, ${lineStartColor}, ${lineEndColor})`,
                transition: 'transform 1.0s',
                transitionTimingFunction: 'ease-out',
            },
        }
    }), [lineStartColor, lineEndColor, backgroundLineColor]);
    return <GradientLinearProgressInner {...otherProps}/>
}

export default GradientLinearProgress;
