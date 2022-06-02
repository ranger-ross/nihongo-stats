import React from "react";
// @ts-ignore
import {area, curveCatmullRom} from 'd3-shape';

function Area(props: any) {
    const {
        coordinates,
        color,
    } = props;

    return (
        <path
            fill={color}
            d={area()
                // @ts-ignore
                .x(({arg}) => arg)
                // @ts-ignore
                .y1(({val}) => val)
                // @ts-ignore
                .y0(({startVal}) => startVal)
                .curve(curveCatmullRom)(coordinates)}
            opacity={0.5}
        />
    );
}


export default Area;
