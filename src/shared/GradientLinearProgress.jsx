import {styled} from "@mui/material/styles";
import {LinearProgress, linearProgressClasses} from "@mui/material";
import PropTypes from "prop-types";
import {useMemo} from "react";

function GradientLinearProgress({lineStartColor, lineEndColor, backgroundLineColor, ...otherProps}) {
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

GradientLinearProgress.propTypes = {
    ...LinearProgress.propTypes,
    lineStartColor: PropTypes.string,
    lineEndColor: PropTypes.string,
    backgroundLineColor: PropTypes.string,
};

export default GradientLinearProgress;
