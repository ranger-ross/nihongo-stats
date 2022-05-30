import useWindowDimensions from "./useWindowDimensions";

const mobileMaxWidth = 600;

export function useDeviceInfo() {
    const {width} = useWindowDimensions();
    const isMobile = width <= mobileMaxWidth;

    return {
        isMobile
    };
}
