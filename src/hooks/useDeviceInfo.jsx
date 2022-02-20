import useWindowDimensions from "./useWindowDimensions.jsx";

const mobileMaxWidth = 768;

export function useDeviceInfo() {
    const {width} = useWindowDimensions();
    const isMobile = width <= mobileMaxWidth;

    return {
        isMobile
    };
}
