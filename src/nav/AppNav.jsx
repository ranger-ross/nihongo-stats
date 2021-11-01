import { useGlobalState } from "../GlobalState";

function AppNav() {
    const {selectedApp, setSelectedApp} = useGlobalState();

    return (
        <div>
            {selectedApp}
        </div>
    );
}

export default AppNav;