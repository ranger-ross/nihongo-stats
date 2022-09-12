import {useState, useEffect} from 'react';

function getWindowDimensions() {
    const {innerWidth: width, innerHeight: height} = window;
    return {
        width,
        height
    };
}

// TODO: Fix issue with 'Maximum update depth exceeded' when resizing window.
export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            const d = getWindowDimensions();
            if (d.width !== windowDimensions.width || d.height !== windowDimensions.height) {
                setWindowDimensions(getWindowDimensions());
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
